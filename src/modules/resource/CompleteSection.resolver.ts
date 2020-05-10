import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { CompleteSectionInput } from './resource/CompleteSectionInput'
import { isAuthorized } from '../middleware/isAuthorized'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { Progress } from '../../entity/Progress.entity'
import { Section } from '../../entity/Section.entity'
import { Resource } from '../../entity/Resource.entity'

@Resolver()
export class CompleteSectionResolver {
  @Mutation(() => Progress)
  @UseMiddleware(isAuthorized)
  async startProgress(
    @Arg('resourceId') resourceId: string,
    @CurrentUser() currentUser: User
  ): Promise<Progress> {
    const [resource] = await Resource.find({ where: { id: resourceId } })
    if (!resource) {
      throw new Error('Invalid Resource')
    }
    const [progressExists] = await Progress.find({
      where: { user: currentUser, resource },
    })
    if (progressExists) {
      return progressExists
    }

    const progress = new Progress()
    progress.user = Promise.resolve(currentUser)
    progress.resource = Promise.resolve(resource)
    progress.completedSections = Promise.resolve([])
    return progress.save()
  }

  @Mutation(() => Progress, { nullable: true })
  @UseMiddleware(isAuthorized)
  async completeSection(
    @Arg('data') { sectionId }: CompleteSectionInput,
    @CurrentUser() currentUser: User
  ): Promise<Progress | null> {
    const [section] = await Section.find({ where: { id: sectionId } })
    const page = await section.page
    if (!page) {
      return null
    }
    const baseSection = await section.baseSection
    const resource = await baseSection.resource
    const [progress] = await Progress.find({
      where: { user: currentUser, resource },
    })
    if (!progress) {
      const progress = new Progress()
      progress.user = Promise.resolve(currentUser)
      progress.completedSections = Promise.resolve([section])
      progress.resource = Promise.resolve(resource)
      return progress.save()
    }
    const completedSections = await progress.completedSections
    if (
      completedSections.some(
        (currentSection) => currentSection.id === section.id
      )
    ) {
      return progress
    }

    progress.completedSections = Promise.resolve([
      ...completedSections,
      section,
    ])
    return progress.save()
  }
}

import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { CompleteSectionInput } from './resource/CompleteSectionInput'
import { isAuthorized } from '../middleware/isAuthorized'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { Progress } from '../../entity/Progress.entity'
import { Section } from '../../entity/Section.entity'

@Resolver()
export class CompleteSectionResolver {
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
    progress.completedSections = Promise.resolve([
      ...completedSections,
      section,
    ])
    return progress.save()
  }
}

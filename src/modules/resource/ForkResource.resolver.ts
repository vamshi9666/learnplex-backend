import { Arg, Mutation, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'
import { Resource } from '../../entity/Resource.entity'
import { Section } from '../../entity/Section.entity'
import { Page } from '../../entity/Page.entity'
import { ForkResourceInput } from './resource/ForkResourceInput'

export class ForkResourceResolver {
  @Mutation(() => Resource, { nullable: true })
  @UseMiddleware(isAuthorized)
  async forkResource(
    @Arg('data')
    { username, resourceSlug }: ForkResourceInput,
    @CurrentUser() currentUser: User
  ): Promise<Resource | null> {
    if (currentUser.username === username) {
      return null
    }
    const resource = await getResource(username, resourceSlug)
    const [forkExists] = await Resource.find({
      where: { forkedFrom: resource, user: currentUser },
    })
    if (forkExists) {
      return null
    }
    if (!resource) {
      return null
    }
    const forkedResource = new Resource()
    forkedResource.title = resource.title
    forkedResource.user = Promise.resolve(currentUser)
    forkedResource.topic = resource.topic
    forkedResource.isFork = true
    forkedResource.forkedFrom = Promise.resolve(resource)
    await this.forkBaseSection(resource, forkedResource)
    return forkedResource
  }

  async forkBaseSection(resource: Resource, forkedResource: Resource) {
    // fork base section
    const baseSection = await resource.baseSection
    const forkedBaseSection = new Section()
    forkedBaseSection.title = baseSection.title
    forkedBaseSection.sections = Promise.resolve([])
    forkedBaseSection.isFork = true
    await forkedBaseSection.save()

    // Save the forked resource
    forkedResource.baseSection = Promise.resolve(forkedBaseSection)
    await forkedResource.save()

    await this.forkSubSections(
      baseSection,
      forkedBaseSection,
      forkedBaseSection
    )
  }

  async forkSubSections(
    currentSection: Section,
    forkedParentSection: Section,
    forkedBaseSection: Section
  ) {
    const subSections = await currentSection.sections
    for (const subSection of subSections) {
      const forkedSubSection = new Section()
      forkedSubSection.title = subSection.title
      forkedSubSection.sections = Promise.resolve([])
      forkedSubSection.order = subSection.order
      forkedSubSection.isFork = true
      forkedSubSection.parentSection = Promise.resolve(forkedParentSection)
      forkedSubSection.baseSection = Promise.resolve(forkedBaseSection)
      await forkedSubSection.save()
      await this.forkSubSections(
        subSection,
        forkedSubSection,
        forkedBaseSection
      )
    }
    const page = await currentSection.page
    if (page) {
      const forkedPage = new Page()
      forkedPage.type = page.type
      forkedPage.content = page.content
      forkedPage.isFork = true
      await forkedPage.save()
      forkedParentSection.page = Promise.resolve(forkedPage)
      await forkedParentSection.save()
    }
  }
}

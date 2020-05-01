import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Resource } from '../../entity/Resource.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { Section } from '../../entity/Section.entity'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'

@Resolver()
export class ResourcesResolver {
  @UseMiddleware(isAuthorized)
  @Query(() => [Resource])
  async resources(@CurrentUser() currentUser: User): Promise<Resource[]> {
    return currentUser.resources
  }

  @Query(() => Resource, { nullable: true })
  async resource(
    @Arg('username') username: string,
    @Arg('resourceSlug') slug: string
  ) {
    return getResource(username, slug)
  }

  @Query(() => Section)
  async baseSection(
    @Arg('username') username: string,
    @Arg('resourceSlug') slug: string
  ) {
    const resource = await getResource(username, slug)
    if (!resource) {
      return null
    }
    const baseSection = await resource.baseSection
    const sections = await baseSection.sections
    baseSection.sections = Promise.resolve(
      sections.filter((section) => !section.deleted)
    )
    return baseSection
  }
}

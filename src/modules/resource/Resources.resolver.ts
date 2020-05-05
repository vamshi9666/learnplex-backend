import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Resource } from '../../entity/Resource.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { Section } from '../../entity/Section.entity'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'
import { hasRole } from '../middleware/hasRole'
import { UserRole } from '../../entity/enums/UserRole.enum'

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

  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  @Query(() => [Resource])
  async allResources(): Promise<Resource[]> {
    return Resource.find()
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

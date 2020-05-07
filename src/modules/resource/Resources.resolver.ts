import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Resource } from '../../entity/Resource.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { Section } from '../../entity/Section.entity'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'
import { Topic } from '../../entity/Topic.entity'

@Resolver()
export class ResourcesResolver {
  @UseMiddleware(isAuthorized)
  @Query(() => [Resource])
  async resources(@CurrentUser() currentUser: User): Promise<Resource[]> {
    return currentUser.resources
  }

  @Query(() => [Resource])
  async resourcesByUsername(@Arg('username') username: string) {
    const [user] = await User.find({ where: { username } })
    if (!user) {
      throw new Error('Invalid username')
    }
    return user.resources
  }

  @Query(() => [Resource])
  async resourcesByTopic(@Arg('slug') slug: string) {
    const [topic] = await Topic.find({ where: { slug } })
    if (!topic) {
      throw new Error('Invalid topic')
    }
    return topic.resources
  }

  @Query(() => Resource, { nullable: true })
  async resource(
    @Arg('username') username: string,
    @Arg('resourceSlug') slug: string
  ) {
    return getResource(username, slug)
  }

  @Query(() => [Resource])
  async allResources(): Promise<Resource[]> {
    return Resource.find()
  }

  @Query(() => [Resource])
  async allVerifiedResources(): Promise<Resource[]> {
    return Resource.find({ where: { verified: true } })
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

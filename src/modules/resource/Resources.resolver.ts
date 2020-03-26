import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Resource } from '../../entity/Resource.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'

@Resolver()
export class ResourcesResolver {
  @UseMiddleware(isAuthorized)
  @Query(() => [Resource])
  async resources(@CurrentUser() currentUser: User): Promise<Resource[]> {
    return currentUser.resources
  }

  @Query(() => Resource, { nullable: true })
  async resource(@Arg('username') username: string, @Arg('slug') slug: string) {
    const [user] = await User.find({ where: { username }, take: 1 })
    console.log(user)
    if (!user) {
      return null
    }
    const userResources = await user.resources
    console.log(userResources)
    const [resource] = userResources.filter(
      (resource: Resource) => resource.slug == slug
    )
    console.log(resource)
    return resource
  }
}

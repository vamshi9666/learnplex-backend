import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { Resource } from '../../entity/Resource.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'

@Resolver()
export class UpdateResourceResolver {
  @Mutation(() => Resource)
  @UseMiddleware(isAuthorized)
  async updateResourceDescription(
    @Arg('resourceSlug') resourceSlug: string,
    @Arg('description') description: string,
    @CurrentUser() currentUser: User
  ): Promise<Resource> {
    const username = currentUser.username
    const resource = await getResource(username, resourceSlug)
    if (!resource) {
      throw new Error('Invalid Resource')
    }
    resource.description = description
    return resource.save()
  }

  @Mutation(() => Resource)
  @UseMiddleware(isAuthorized)
  async updateResourceTitle(
    @Arg('resourceSlug') resourceSlug: string,
    @Arg('title') title: string,
    @CurrentUser() currentUser: User
  ): Promise<Resource> {
    const username = currentUser.username
    const resource = await getResource(username, resourceSlug)
    if (!resource) {
      throw new Error('Invalid Resource')
    }
    resource.title = title
    return resource.save()
  }
}

import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { UserRole } from '../../entity/enums/UserRole.enum'
import { Resource } from '../../entity/Resource.entity'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'

@Resolver()
export class PublishResourcesResolver {
  @UseMiddleware(isAuthorized)
  @Mutation(() => Resource)
  async togglePublishStatus(
    @Arg('resourceId') resourceId: string,
    @CurrentUser() currentUser: User
  ): Promise<Resource> {
    const [resource] = await Resource.find({ where: { id: resourceId } })
    if (!resource) {
      throw new Error('Invalid Resource')
    }
    if (
      !currentUser.roles.includes(UserRole.ADMIN) &&
      currentUser.id !== resource.userId
    ) {
      throw new Error('Unauthorized')
    }
    resource.published = !resource.published
    return resource.save()
  }
}

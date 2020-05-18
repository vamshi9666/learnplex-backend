import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { hasRole } from '../middleware/hasRole'
import { UserRole } from '../../entity/enums/UserRole.enum'
import { Resource } from '../../entity/Resource.entity'

@Resolver()
export class PublishResourcesResolver {
  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  @Mutation(() => Resource)
  async togglePublishStatus(
    @Arg('resourceId') resourceId: string
  ): Promise<Resource> {
    const [resource] = await Resource.find({ where: { id: resourceId } })
    if (!resource) {
      throw new Error('Invalid Resource')
    }
    resource.published = !resource.published
    return resource.save()
  }
}

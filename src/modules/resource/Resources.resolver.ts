import { Query, Resolver, UseMiddleware } from 'type-graphql'

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
}

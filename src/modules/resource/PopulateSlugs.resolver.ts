import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { hasRole } from '../middleware/hasRole'
import { UserRole } from '../../entity/enums/UserRole.enum'
import { Resource } from '../../entity/Resource.entity'
import { populateSlugsForResource } from '../utils/populateSlugsForResource'

@Resolver()
export class PopulateSlugsResolver {
  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  @Mutation(() => Boolean)
  async populateSlugsForAllResources() {
    const resources = await Resource.find()
    for (const resource of resources) {
      await populateSlugsForResource({ resourceId: resource.id })
    }
    return true
  }

  @UseMiddleware(isAuthorized)
  @Mutation(() => Boolean)
  async populateSlugsByResourceId(@Arg('resourceId') resourceId: string) {
    await populateSlugsForResource({ resourceId })
    return true
  }
}

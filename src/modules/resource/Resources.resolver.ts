import { Query, Resolver } from 'type-graphql'

import { Resource } from '../../entity/Resource.entity'

@Resolver()
export class ResourcesResolver {
  @Query(() => [Resource])
  async resources(): Promise<Resource[]> {
    return Resource.find()
  }
}

import { Arg, Mutation, Resolver } from 'type-graphql'
import { getConnection } from 'typeorm'

import { Resource } from '../../entity/Resource.entity'

@Resolver()
export class SearchResourceResolver {
  @Mutation(() => [Resource])
  async searchResources(@Arg('value') value: string): Promise<Resource[]> {
    return getConnection()
      .getRepository(Resource)
      .createQueryBuilder()
      .select()
      .where('title ILIKE :searchTerm', { searchTerm: `%${value}%` })
      .getMany()
  }
}

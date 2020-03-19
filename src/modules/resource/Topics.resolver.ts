import { Query, Resolver } from 'type-graphql'

import { Topic } from '../../entity/Topic.entity'

@Resolver()
export class TopicsResolver {
  @Query(() => [Topic])
  async topics(): Promise<Topic[]> {
    return Topic.find()
  }
}

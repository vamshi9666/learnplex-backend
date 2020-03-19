import { Arg, Mutation, Resolver } from 'type-graphql'

import { Topic } from '../../entity/Topic.entity'
import { CreateTopicInput } from './topic/CreateTopicInput'

@Resolver()
export class CreateTopicResolver {
  @Mutation(() => Topic)
  async createTopic(@Arg('data') { title }: CreateTopicInput): Promise<Topic> {
    return Topic.create({ title, resources: Promise.resolve([]) }).save()
  }
}

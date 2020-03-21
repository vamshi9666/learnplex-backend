import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { Topic } from '../../entity/Topic.entity'
import { CreateTopicInput } from './topic/CreateTopicInput'
import { isAuthorized } from '../middleware/isAuthorized'
import { hasRole } from '../middleware/hasRole'
import { UserRole } from '../../entity/enums/UserRole.enum'

@Resolver()
export class CreateTopicResolver {
  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  @Mutation(() => Topic)
  async createTopic(@Arg('data') { title }: CreateTopicInput): Promise<Topic> {
    return Topic.create({ title, resources: Promise.resolve([]) }).save()
  }
}

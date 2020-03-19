import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { Topic } from '../../entity/Topic.entity'
import { CreateResourceInput } from './resource/CreateResourceInput'
import { Resource } from '../../entity/Resource.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { MyContext } from '../../types/MyContext'
import { User } from '../../entity/User.entity'

@Resolver()
export class CreateResourceResolver {
  @Mutation(() => Resource)
  @UseMiddleware(isAuthorized)
  async createResource(
    @Arg('data') { title, topicId }: CreateResourceInput,
    @Ctx() { payload }: MyContext
  ): Promise<Resource> {
    const [user] = await User.find({ where: { id: payload?.userId }, take: 1 })
    const [topic] = await Topic.find({ where: { id: topicId }, take: 1 })
    const resource = new Resource()
    resource.title = title
    resource.sections = Promise.resolve([])
    resource.topic = Promise.resolve(topic)
    resource.user = Promise.resolve(user)
    return resource.save()
  }
}

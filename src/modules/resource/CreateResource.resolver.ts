import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { Topic } from '../../entity/Topic.entity'
import { CreateResourceInput } from './resource/CreateResourceInput'
import { Resource } from '../../entity/Resource.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { User } from '../../entity/User.entity'
import { slug } from '../../utils/slug'
import CurrentUser from '../../decorators/currentUser'

@Resolver()
export class CreateResourceResolver {
  @Mutation(() => Resource)
  @UseMiddleware(isAuthorized)
  async createResource(
    @Arg('data') { title, topicId }: CreateResourceInput,
    @CurrentUser() currentUser: User
  ): Promise<Resource> {
    const resources = await currentUser.resources
    if (resources.some((resource) => resource.slug() == slug(title))) {
      throw new Error('Resource with this title already exists')
    }
    const [topic] = await Topic.find({ where: { id: topicId }, take: 1 })
    const resource = new Resource()
    resource.title = title
    resource.sections = Promise.resolve([])
    resource.topic = Promise.resolve(topic)
    resource.user = Promise.resolve(currentUser)
    return resource.save()
  }
}

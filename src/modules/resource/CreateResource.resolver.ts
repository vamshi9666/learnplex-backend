import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { Topic } from '../../entity/Topic.entity'
import { CreateResourceInput } from './resource/CreateResourceInput'
import { Resource } from '../../entity/Resource.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { User } from '../../entity/User.entity'
import CurrentUser from '../../decorators/currentUser'
import { Section } from '../../entity/Section.entity'

@Resolver()
export class CreateResourceResolver {
  @Mutation(() => Resource)
  @UseMiddleware(isAuthorized)
  async createResource(
    @Arg('data') { title, topicId, description, slug }: CreateResourceInput,
    @CurrentUser() currentUser: User
  ): Promise<Resource> {
    const baseSection = new Section()
    baseSection.title = title + '-base-section'
    baseSection.sections = Promise.resolve([])
    const savedBaseSection = await baseSection.save()

    const resources = await currentUser.resources
    if (resources.some((resource) => resource.slug === slug)) {
      throw new Error('Resource with this slug already exists')
    }
    const [topic] = await Topic.find({ where: { id: topicId }, take: 1 })
    const resource = new Resource()
    resource.title = title
    resource.slug = slug
    resource.baseSection = Promise.resolve(savedBaseSection)
    resource.topic = Promise.resolve(topic)
    resource.user = Promise.resolve(currentUser)
    resource.description = description
    return resource.save()
  }
}

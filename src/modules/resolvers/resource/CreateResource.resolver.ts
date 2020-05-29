import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { CreateResourceInput } from '../../resource/resource/CreateResourceInput'
import { Resource } from '../../../entity/Resource.entity'
import { Section } from '../../../entity/Section.entity'
import CurrentUser from '../../../decorators/currentUser'
import { User } from '../../../entity/User.entity'
import { isAuthorized } from '../../middleware/isAuthorized'

@Resolver()
export class CreateResourceResolverV2 {
  @Mutation(() => Resource)
  @UseMiddleware(isAuthorized)
  async createResourceV2(
    @Arg('data') { title, topicId, description, slug }: CreateResourceInput,
    @CurrentUser() currentUser: User
  ): Promise<Resource> {
    if ((await Resource.count({ where: { slug }, take: 1 })) > 0) {
      throw new Error('Resource with this slug already exists')
    }
    const baseSection = new Section()
    baseSection.title = title + '-base-section'
    baseSection.sections = Promise.resolve([])
    await baseSection.save()

    const resource = new Resource()
    resource.baseSectionId = baseSection.id
    resource.userId = currentUser.id
    resource.topicId = topicId
    resource.title = title
    resource.slug = slug
    resource.description = description
    return resource.save()
  }
}

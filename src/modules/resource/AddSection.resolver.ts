import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { AddSectionInput } from './resource/AddSectionInput'
import { Section } from '../../entity/Section.entity'
import { Resource } from '../../entity/Resource.entity'

@Resolver()
export class AddSectionResolver {
  @Mutation(() => Section)
  @UseMiddleware(isAuthorized)
  async addSection(
    @Arg('data') { title, resourceId }: AddSectionInput
  ): Promise<Section> {
    const [resource] = await Resource.find({
      where: { id: resourceId },
      take: 1
    })
    const section = new Section()
    section.title = title
    section.resource = Promise.resolve(resource)
    section.sections = Promise.resolve([])
    return section.save()
  }
}

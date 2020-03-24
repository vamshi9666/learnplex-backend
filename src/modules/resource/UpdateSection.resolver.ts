import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { UpdateSectionInput } from './resource/UpdateSectionInput'
import { Section } from '../../entity/Section.entity'

@Resolver()
export class UpdateSectionResolver {
  @Mutation(() => Section)
  @UseMiddleware(isAuthorized)
  async updateSection(
    @Arg('data') { title, sectionId }: UpdateSectionInput
  ): Promise<Section> {
    const [section] = await Section.find({ where: { id: sectionId }, take: 1 })
    section.title = title
    return section.save()
  }
}

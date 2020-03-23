import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { Section } from '../../entity/Section.entity'
import { AddSubSectionInput } from './resource/AddSubSectionInput'

@Resolver()
export class AddSubSectionResolver {
  @Mutation(() => Section)
  @UseMiddleware(isAuthorized)
  async addSubSection(
    @Arg('data') { title, sectionId }: AddSubSectionInput
  ): Promise<Section> {
    const [section] = await Section.find({
      where: { id: sectionId },
      take: 1
    })
    const subSection = new Section()
    subSection.title = title
    subSection.sections = Promise.resolve([])
    subSection.parentSection = Promise.resolve(section)
    return subSection.save()
  }
}

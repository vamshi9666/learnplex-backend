import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { AddSectionInput } from './resource/AddSectionInput'
import { Section } from '../../entity/Section.entity'

@Resolver()
export class AddSectionResolver {
  @Mutation(() => Section)
  @UseMiddleware(isAuthorized)
  async addSection(
    @Arg('data') { title, parentSectionId }: AddSectionInput
  ): Promise<Section> {
    const [parentSection] = await Section.find({
      where: { id: parentSectionId },
      take: 1,
    })

    const newSection = new Section()
    newSection.title = title
    newSection.parentSection = Promise.resolve(parentSection)
    newSection.sections = Promise.resolve([])
    if (await parentSection.isBaseSection()) {
      newSection.baseSection = Promise.resolve(parentSection)
    } else {
      newSection.baseSection = parentSection.baseSection
    }
    return newSection.save()
  }
}

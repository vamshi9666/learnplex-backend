import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { slug } from '../../utils/slug'
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
    let siblingSections
    const isRoot = await section.isRoot()
    if (isRoot) {
      const resource = await section.resource
      siblingSections = await resource.sections
    } else {
      const parent = await section.parentSection
      siblingSections = await parent.sections
    }
    if (
      siblingSections.some(
        (tempSection) =>
          tempSection.id !== sectionId && tempSection.slug() == slug(title)
      )
    ) {
      throw new Error('Section with this title already exists')
    }
    section.title = title
    return section.save()
  }
}

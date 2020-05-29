import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { UpdateSectionInput } from './resource/UpdateSectionInput'
import { Section } from '../../entity/Section.entity'
import { Resource } from '../../entity/Resource.entity'
import { populateSlugsForResource } from '../utils/populateSlugsForResource'

@Resolver()
export class UpdateSectionResolver {
  @Mutation(() => Section)
  @UseMiddleware(isAuthorized)
  async updateSection(
    @Arg('data') { title, sectionId }: UpdateSectionInput
  ): Promise<Section> {
    const [section] = await Section.find({
      where: { id: sectionId, deleted: false },
      take: 1,
    })
    section.title = title
    return section.save()
  }

  @Mutation(() => Section)
  @UseMiddleware(isAuthorized)
  async updateSectionTitle(
    @Arg('title') title: string,
    @Arg('sectionId') sectionId: string
  ): Promise<Section> {
    const [section] = await Section.find({
      where: { id: sectionId, deleted: false },
      take: 1,
    })
    if (!section) {
      throw new Error('Invalid Section Id')
    }
    section.title = title
    const baseSectionId = section.baseSectionId
    const [resource] = await Resource.find({
      where: { baseSectionId },
      take: 1,
    })
    const savedSection = await section.save()
    await populateSlugsForResource({ resourceId: resource.id })
    const [sectionAfterSlugsUpdate] = await Section.find({
      where: { id: savedSection.id, deleted: false },
      take: 1,
    })
    return sectionAfterSlugsUpdate
  }
}

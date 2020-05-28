import { Arg, Query, Resolver } from 'type-graphql'

import { Section } from '../../entity/Section.entity'
import { Resource } from '../../entity/Resource.entity'
import { getConnection } from 'typeorm'

@Resolver()
export class SectionsResolver {
  @Query(() => [Section])
  async sections(@Arg('resourceId') resourceId: string): Promise<Section[]> {
    const [resource] = await Resource.find({
      where: { id: resourceId },
      take: 1,
    })
    if (!resource) {
      return []
    }
    const baseSection = await resource.baseSection
    return baseSection.sections
  }

  @Query(() => [Section])
  async sectionsListByBaseSectionId(
    @Arg('baseSectionId') baseSectionId: string
  ) {
    const [baseSection] = await Section.find({
      where: { id: baseSectionId, deleted: false },
      take: 1,
    })
    if (!baseSection) {
      throw new Error('Invalid base section id')
    }
    const sectionsListData = [baseSection]
    const sections = await Section.find({
      where: { baseSectionId, deleted: false },
    })
    sectionsListData.push(...sections)
    for (const section of sectionsListData) {
      const sections = await section.sections
      section.sections = Promise.resolve(
        sections.filter((section) => !section.deleted)
      )
    }
    return sectionsListData
  }

  @Query(() => Section)
  async sectionBySlugsPathAndBaseSectionId(
    @Arg('slugsPath') slugsPath: string,
    @Arg('baseSectionId') baseSectionId: string
  ) {
    const [section] = await Section.find({
      where: { baseSectionId, slugsPath, deleted: false },
      take: 1,
    })
    if (!section) {
      throw new Error('Invalid path')
    }
    return section
  }

  @Query(() => [Section])
  async siblingSections(
    @Arg('sectionId') sectionId: string
  ): Promise<Section[]> {
    const [currentSection] = await Section.find({
      where: { id: sectionId, deleted: false },
      take: 1,
    })

    if (!currentSection) {
      throw new Error('Invalid section Id')
    }
    return getConnection()
      .getRepository(Section)
      .createQueryBuilder('section')
      .leftJoinAndSelect(
        'section.sections',
        'sub_section',
        'sub_section.deleted = :isDeleted AND sub_section.parentSectionId = section.id',
        { isDeleted: false }
      )
      .where(
        'section.parentSectionId = :parentSectionId AND section.deleted = :isDeleted',
        { isDeleted: false, parentSectionId: currentSection.parentSectionId }
      )
      .getMany()
  }
}

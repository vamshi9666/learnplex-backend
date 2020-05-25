import { Arg, Query, Resolver } from 'type-graphql'

import { Section } from '../../entity/Section.entity'
import { Resource } from '../../entity/Resource.entity'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'

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

  async getSectionListFromBaseSectionId(baseSectionId: string) {
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

  @Query(() => [Section])
  async sectionsList(
    @Arg('username') username: string,
    @Arg('resourceSlug') resourceSlug: string
  ): Promise<Section[]> {
    const resource = await getResource(username, resourceSlug)
    console.log(resource)
    if (!resource) {
      throw new Error('Resource not found')
    }
    return this.getSectionListFromBaseSectionId(resource.baseSectionId)
  }

  @Query(() => [Section])
  async sectionsListByBaseSectionId(
    @Arg('baseSectionId') baseSectionId: string
  ) {
    return this.getSectionListFromBaseSectionId(baseSectionId)
  }

  @Query(() => Section)
  async sectionBySlugsPathAndBaseSectionId(
    @Arg('slugsPath') slugsPath: string,
    @Arg('baseSectionId') baseSectionId: string
  ) {
    // const baseSection = await Section.find({ where: { id: baseSectionId } })
    // console.log({ slugsPath, baseSectionId, baseSection })
    const [section] = await Section.find({
      where: { baseSectionId, slugsPath, deleted: false },
      take: 1,
    })
    console.log({ section, slugsPath })
    if (!section) {
      throw new Error('Invalid path')
    }
    console.log({ section })
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
    const parentSectionId = currentSection.parentSectionId
    return Section.find({
      where: { parentSectionId, deleted: false },
    })
  }
}

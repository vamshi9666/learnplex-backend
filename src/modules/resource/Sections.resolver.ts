import { Arg, Mutation, Query, Resolver } from 'type-graphql'

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
      where: { id: baseSectionId },
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
    console.log({ sectionsListData })
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

  async getFirstLeaf(
    section: Section,
    paths: { firstLeafPath: string; lastLeafPath: string }
  ): Promise<string> {
    const subSections = await Section.find({
      where: { parentSectionId: section.id, deleted: false },
      order: {
        order: 'ASC',
      },
    })
    if (subSections.length === 0) {
      return section.id
    }
    const firstSubSection = subSections[0]
    paths.firstLeafPath = paths.firstLeafPath + '/' + firstSubSection.slug
    return this.getFirstLeaf(firstSubSection, paths)
  }

  async getLastLeaf(
    section: Section,
    paths: { firstLeafPath: string; lastLeafPath: string }
  ): Promise<string> {
    const subSections = await Section.find({
      where: { parentSectionId: section.id, deleted: false },
      order: {
        order: 'DESC',
      },
    })
    if (subSections.length === 0) {
      return section.id
    }
    const firstSubSection = subSections[0]
    paths.lastLeafPath = paths.lastLeafPath + '/' + firstSubSection.slug
    return this.getLastLeaf(firstSubSection, paths)
  }

  async setSlugsPath(currentSection: Section) {
    let sections = await currentSection.sections
    sections = sections.filter((section) => !section.deleted)
    sections = sections.sort((a, b) => {
      return a.order > b.order ? 1 : a.order < b.order ? -1 : 0
    })
    for (let index = 0; index < sections.length; index++) {
      let section = sections[index]
      section.slugsPath = currentSection.slugsPath + '/' + section.slug
      const paths = {
        firstLeafPath: section.slugsPath,
        lastLeafPath: section.slugsPath,
      }
      section.firstLeafSectionId = await this.getFirstLeaf(section, paths)
      section.firstLeafSlugsPath = paths.firstLeafPath
      section.lastLeafSectionId = await this.getLastLeaf(section, paths)
      section.lastLeafSlugsPath = paths.lastLeafPath
      if (index - 1 >= 0) section.previousSectionId = sections[index - 1].id
      else section.previousSectionId = currentSection.previousSectionId
      if (index + 1 < sections.length)
        section.nextSectionId = sections[index + 1].id
      else section.nextSectionId = currentSection.nextSectionId
      section.pathWithSectionIds =
        currentSection.pathWithSectionIds + '/' + section.id
      section = await section.save()
      await this.setSlugsPath(section)
    }
  }

  @Mutation(() => Boolean)
  async initializeSlugsForAllSections() {
    const resources = await Resource.find()
    for (const resource of resources) {
      let baseSection = await resource.baseSection
      baseSection.slugsPath = ''
      baseSection.pathWithSectionIds = ''
      baseSection = await baseSection.save()
      await this.setSlugsPath(baseSection)
    }
    return true
  }

  @Query(() => Section)
  async sectionBySlugsPathAndBaseSectionId(
    @Arg('slugsPath') slugsPath: string,
    @Arg('baseSectionId') baseSectionId: string
  ) {
    // const baseSection = await Section.find({ where: { id: baseSectionId } })
    // console.log({ slugsPath, baseSectionId, baseSection })
    const [section] = await Section.find({
      where: { baseSectionId, slugsPath },
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
      where: { id: sectionId },
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

import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { AddSectionInput } from './resource/AddSectionInput'
import { Section } from '../../entity/Section.entity'
import { Page } from '../../entity/Page.entity'
import { Resource } from '../../entity/Resource.entity'
import { populateSlugsForResource } from '../utils/populateSlugsForResource'

@Resolver()
export class AddSectionResolver {
  @Mutation(() => Section)
  @UseMiddleware(isAuthorized)
  async addSection(
    @Arg('data') { title, parentSectionId, content }: AddSectionInput
  ): Promise<Section> {
    const [parentSection] = await Section.find({
      where: { id: parentSectionId, deleted: false },
      take: 1,
    })
    let baseSectionId
    if (await parentSection.isBaseSection()) {
      baseSectionId = parentSectionId
    } else {
      baseSectionId = parentSection.baseSectionId
    }
    const [resource] = await Resource.find({
      where: { baseSectionId },
      take: 1,
    })

    const newSection = new Section()
    newSection.title = title
    newSection.parentSection = Promise.resolve(parentSection)
    newSection.sections = Promise.resolve([])
    newSection.baseSectionId = baseSectionId
    newSection.depth = parentSection.depth + 1
    if (content) {
      const page = new Page()
      page.content = content
      const savedPage = await page.save()
      newSection.page = Promise.resolve(savedPage)
      return newSection.save()
    }
    const savedSection = await newSection.save()
    await populateSlugsForResource({ resourceId: resource.id })
    return savedSection
  }
}

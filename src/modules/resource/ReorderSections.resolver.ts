import { Arg, Mutation, Resolver } from 'type-graphql'
import { Section } from '../../entity/Section.entity'
import { Between, getConnection, In } from 'typeorm'
import { ReorderSectionsInput } from './resource/ReorderSectionsInput'
import { populateSlugsForResource } from '../utils/populateSlugsForResource'
import { Resource } from '../../entity/Resource.entity'

@Resolver()
export class ReorderSectionsResolver {
  @Mutation(() => Section)
  async reorderSections(
    @Arg('data')
    { parentSectionId, sourceOrder, destinationOrder }: ReorderSectionsInput
  ): Promise<Section> {
    const [parentSection] = await Section.find({
      where: { id: parentSectionId, deleted: false },
      take: 1,
    })
    if (!parentSection) {
      throw new Error('Invalid Section')
    }
    const childSections = await parentSection.sections
    const sectionIds = childSections.map((section) => section.id)
    const [sourceSectionId] = childSections
      .filter((section) => section.order === sourceOrder)
      .map((section) => section.id)

    if (sourceOrder < destinationOrder) {
      await getConnection()
        .getRepository(Section)
        .decrement(
          {
            id: In(sectionIds),
            order: Between(sourceOrder + 1, destinationOrder),
          },
          'order',
          1
        )
      await Section.update({ id: sourceSectionId }, { order: destinationOrder })
    } else {
      await getConnection()
        .getRepository(Section)
        .increment(
          {
            id: In(sectionIds),
            order: Between(destinationOrder, sourceOrder - 1),
          },
          'order',
          1
        )
      await Section.update({ id: sourceSectionId }, { order: destinationOrder })
    }
    const [updatedParent] = await Section.find({
      where: { id: parentSectionId, deleted: false },
      take: 1,
    })
    const sections = await updatedParent.sections
    updatedParent.sections = Promise.resolve(sections.filter((a) => !a.deleted))
    const baseSectionId = (await updatedParent.isBaseSection())
      ? updatedParent.id
      : updatedParent.baseSectionId
    const [resource] = await Resource.find({ where: { baseSectionId } })
    await populateSlugsForResource({ resourceId: resource.id })
    return updatedParent
  }
}

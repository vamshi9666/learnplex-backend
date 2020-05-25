import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'

import { isAuthorized } from '../middleware/isAuthorized'
import { Section } from '../../entity/Section.entity'
import { getConnection } from 'typeorm'

@Resolver()
export class DeleteSectionResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuthorized)
  async deleteSection(@Arg('sectionId') sectionId: string): Promise<boolean> {
    const [section] = await Section.find({
      where: { id: sectionId, deleted: false },
      take: 1,
    })
    if (!section) {
      return false
    }
    section.deleted = true
    await getConnection()
      .createQueryBuilder()
      .update(Section)
      .set({ deleted: true, title: 'parent-deleted' })
      .where('parentSection.id = :parentSectionId', {
        parentSectionId: section.id,
      })
      .execute()
    section.title = section.title + '-deleted'
    await section.save()
    return true
  }
}

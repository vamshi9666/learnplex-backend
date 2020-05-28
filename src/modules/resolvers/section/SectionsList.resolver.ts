import { Arg, Query, Resolver } from 'type-graphql'
import { getConnection } from 'typeorm'
import { Section } from '../../../entity/Section.entity'

@Resolver()
export class SectionsListResolver {
  @Query(() => [Section])
  async sectionsListFromBaseSectionIdV2(
    @Arg('baseSectionId') baseSectionId: string
  ) {
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
        'section.baseSectionId = :baseSectionId AND section.deleted = :isDeleted',
        { isDeleted: false, baseSectionId }
      )
      .orWhere('section.id = :baseSectionId', { baseSectionId })
      .getMany()
  }
}

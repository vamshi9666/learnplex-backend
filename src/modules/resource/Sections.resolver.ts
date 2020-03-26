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

  @Query(() => [Section])
  async sectionsList(
    @Arg('username') username: string,
    @Arg('resourceSlug') resourceSlug: string
  ): Promise<Section[]> {
    const resource = await getResource(username, resourceSlug)
    if (!resource) {
      return []
    }
    const baseSection = await resource.baseSection
    const sectionsListData = [baseSection]
    sectionsListData.push(
      ...(await Section.find({ where: { baseSection, deleted: false } }))
    )
    return sectionsListData
  }
}

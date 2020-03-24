import { Arg, Query, Resolver } from 'type-graphql'

import { Section } from '../../entity/Section.entity'
import { Resource } from '../../entity/Resource.entity'

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
    @Arg('resourceSlug') resourceSlug: string
  ): Promise<Section[]> {
    console.log(resourceSlug)
    const resources = await Resource.find()
    const [resource] = resources.filter(
      (resource) => resource.slug() === resourceSlug
    )

    console.log(resource)
    if (!resource) {
      return []
    }
    const baseSection = await resource.baseSection
    return await Section.find({ where: { baseSection } })
  }
}

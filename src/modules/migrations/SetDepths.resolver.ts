import { Mutation, Resolver } from 'type-graphql'
import { Resource } from '../../entity/Resource.entity'
import { Section } from '../../entity/Section.entity'

@Resolver()
export class SetDepthsResolver {
  @Mutation(() => Boolean)
  async setDepths() {
    const resources = await Resource.find()
    for (const resource of resources) {
      const [baseSection] = await Section.find({
        where: { id: resource.baseSectionId },
        take: 1,
      })
      baseSection.depth = -1
      await baseSection.save()

      const sections = await Section.find({
        where: { baseSectionId: resource.baseSectionId },
      })
      for (const section of sections) {
        section.depth = await section.getDepth()
        await section.save()
      }
    }
    return true
  }
}

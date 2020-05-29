import { Arg, Mutation, Resolver } from 'type-graphql'

import { SavePageInput } from './resource/SavePageInput'
import { Section } from '../../entity/Section.entity'
import { Page } from '../../entity/Page.entity'

@Resolver()
export class SavePageResolver {
  @Mutation(() => Section)
  async savePage(
    @Arg('data') { sectionId, pageContent }: SavePageInput
  ): Promise<Section> {
    const [section] = await Section.find({
      where: { id: sectionId, deleted: false },
      take: 1,
    })
    console.log({ page: await section.page })
    if (!(await section.page)) {
      const page = new Page()
      page.content = pageContent
      await page.save()
      console.log({ page })
      section.pageId = page.id
      return section.save()
    }
    const page = await section.page
    page.content = pageContent
    await page.save()
    return section
  }
}

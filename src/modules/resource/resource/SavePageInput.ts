import { Field, InputType } from 'type-graphql'

import { ValidSectionId } from './ValidSectionId'

@InputType({ isAbstract: true })
export class SavePageInput {
  @Field()
  @ValidSectionId({ message: 'Invalid section' })
  sectionId: string

  @Field()
  pageContent: string
}

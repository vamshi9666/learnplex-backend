import { Field, InputType } from 'type-graphql'

import { ValidSectionId } from './ValidSectionId'

@InputType({ isAbstract: true })
export class CompleteSectionInput {
  @Field()
  @ValidSectionId({ message: 'Invalid Section' })
  sectionId: string
}

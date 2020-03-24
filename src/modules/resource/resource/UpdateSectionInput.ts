import { Field, InputType } from 'type-graphql'
import { Length } from 'class-validator'

import { ValidSectionId } from './ValidSectionId'

@InputType({ isAbstract: true })
export class UpdateSectionInput {
  @Field()
  @ValidSectionId({ message: 'Invalid section' })
  sectionId: string

  @Field()
  @Length(1, 255)
  title: string
}

import { Field, InputType } from 'type-graphql'
import { Length } from 'class-validator'

import { SectionDoesNotExist } from './SectionDoesNotExist'
import { ValidSectionId } from './ValidSectionId'

@InputType({ isAbstract: true })
export class AddSectionInput {
  @Field()
  @ValidSectionId({ message: 'Invalid resource' })
  parentSectionId: string

  @Field()
  @Length(1, 255)
  @SectionDoesNotExist('parentSectionId', {
    message: 'Section with this title already exists',
  })
  title: string
}

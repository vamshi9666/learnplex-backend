import { Field, InputType } from 'type-graphql'
import { Length } from 'class-validator'

import { SectionDoesNotExist } from './SectionDoesNotExist'
import { ValidSectionId } from './ValidSectionId'

@InputType({ isAbstract: true })
export class AddSubSectionInput {
  @Field()
  @ValidSectionId({ message: 'Invalid section' })
  sectionId: string

  @Field()
  @Length(1, 255)
  @SectionDoesNotExist('sectionId', {
    message: 'Section with this title already exists'
  })
  title: string
}

import { Field, InputType } from 'type-graphql'
import { Length } from 'class-validator'

import { ValidSectionId } from './ValidSectionId'
import { SectionDoesNotExist } from './SectionDoesNotExist'

@InputType({ isAbstract: true })
export class UpdateSectionInput {
  @Field()
  @ValidSectionId({ message: 'Invalid section' })
  sectionId: string

  @Field()
  @Length(1, 255)
  @SectionDoesNotExist('sectionId', {
    message: 'Section with this title already exists',
  })
  title: string
}

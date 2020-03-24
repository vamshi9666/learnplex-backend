import { Field, InputType } from 'type-graphql'
import { Length } from 'class-validator'

import { ValidResourceId } from './ValidResourceId'
import { SectionDoesNotExist } from './SectionDoesNotExist'

@InputType({ isAbstract: true })
export class AddSectionInput {
  @Field()
  @ValidResourceId({ message: 'Invalid resource' })
  resourceId: string

  @Field()
  @Length(1, 255)
  @SectionDoesNotExist('resourceId', {
    message: 'Section with this title already exists',
  })
  title: string
}

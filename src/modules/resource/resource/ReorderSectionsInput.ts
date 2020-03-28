import { Field, InputType } from 'type-graphql'
import { ValidSectionId } from './ValidSectionId'

@InputType({ isAbstract: true })
export class ReorderSectionsInput {
  @Field()
  @ValidSectionId({ message: 'Invalid resource' })
  parentSectionId: string

  @Field()
  sourceOrder: number

  @Field()
  destinationOrder: number
}

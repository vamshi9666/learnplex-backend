import { Field, InputType } from 'type-graphql'
import { Length } from 'class-validator'

import { ValidTopicId } from '../topic/ValidTopicId'

@InputType({ isAbstract: true })
export class CreateResourceInput {
  @Field()
  @Length(1, 255)
  title: string

  @Field()
  @ValidTopicId({ message: 'Invalid topic' })
  topicId: string

  @Field()
  description: string

  @Field()
  slug: string
}

import { Field, InputType } from 'type-graphql'
import { Length } from 'class-validator'

import { TopicDoesNotExist } from './TopicDoesNotExist'

@InputType({ isAbstract: true })
export class CreateTopicInput {
  @Field()
  @Length(1, 255)
  @TopicDoesNotExist({ message: 'Topic with this title already exists' })
  title: string
}

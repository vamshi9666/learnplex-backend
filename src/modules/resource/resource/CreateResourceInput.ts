import { Field, InputType } from 'type-graphql'
import { Length } from 'class-validator'

import { ResourceDoesNotExist } from './ResourceDoesNotExist'
import { ValidTopicId } from '../topic/ValidTopicId'

@InputType({ isAbstract: true })
export class CreateResourceInput {
  @Field()
  @Length(1, 255)
  @ResourceDoesNotExist({ message: 'Resource with this title already exists' })
  title: string

  @Field()
  @ValidTopicId({ message: 'Invalid topic' })
  topicId: string
}

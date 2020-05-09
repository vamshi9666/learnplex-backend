import { Field, ObjectType } from 'type-graphql'

import { User } from '../../../entity/User.entity'
import { Resource } from '../../../entity/Resource.entity'

@ObjectType()
export class ResourceResponse {
  @Field()
  resource: Resource

  @Field()
  user: User
}

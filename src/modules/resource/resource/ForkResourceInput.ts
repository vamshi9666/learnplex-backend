import { Field, InputType } from 'type-graphql'

@InputType({ isAbstract: true })
export class ForkResourceInput {
  @Field()
  username: string

  @Field()
  resourceSlug: string
}

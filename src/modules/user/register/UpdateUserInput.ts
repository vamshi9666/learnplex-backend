import { Field, InputType } from 'type-graphql'
import { Length, IsEmail } from 'class-validator'

@InputType({ isAbstract: true })
export class UpdateUserInput {
  @Field()
  @Length(1, 255)
  name: string

  @Field()
  @IsEmail()
  email: string

  @Field()
  @Length(1, 255)
  username: string
}

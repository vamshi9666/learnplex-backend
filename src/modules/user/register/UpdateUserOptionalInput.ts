import { Field, InputType } from 'type-graphql'
import { Length, IsEmail } from 'class-validator'

@InputType({ isAbstract: true })
export class UpdateUserOptionalInput {
  @Field({ nullable: true })
  @Length(1, 255)
  name: string

  @Field({ nullable: true })
  @IsEmail()
  email: string

  @Field({ nullable: true })
  @Length(1, 255)
  username: string

  @Field()
  @Length(1, 255)
  currentUsername: string
}

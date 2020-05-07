import { Field, InputType } from 'type-graphql'

import { PasswordInput } from '../../shared/PasswordInput'

@InputType({ isAbstract: true })
export class UpdatePasswordInput extends PasswordInput {
  @Field()
  currentPassword: string
}

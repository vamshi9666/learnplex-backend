import { Arg, Mutation, Resolver } from 'type-graphql'

import { User } from '../../entity/User.entity'
import { MailType, sendEmail } from '../utils/sendEmail'
import { createConfirmationUrl } from '../utils/createConfirmationUrl'
import { RegisterInput } from './Register/RegisterInput'

@Resolver()
export class RegisterResolver {
  @Mutation(() => Boolean)
  async register(
    @Arg('data')
    { name, email, password, username }: RegisterInput
  ): Promise<boolean> {
    let user

    try {
      user = await User.create({
        name,
        email,
        username,
        password // hashing this in @BeforeInsert hook in User.entity.ts
      }).save()
    } catch (e) {
      console.error(e)
      return false
    }

    sendEmail(
      email,
      await createConfirmationUrl(user.id),
      MailType.ConfirmationEmail
    )

    return true
  }
}

import { Arg, Mutation, Resolver } from 'type-graphql'

import { User } from '../../entity/User.entity'
import { MailType, sendEmail } from '../utils/sendEmail'
import { createConfirmationUrl } from '../utils/createConfirmationUrl'

@Resolver()
export class SendConfirmationMailResolver {
  @Mutation(() => Boolean)
  async sendConfirmationMail(@Arg('email') email: string): Promise<boolean> {
    const [user] = await User.find({ where: { email }, take: 1 })

    if (!user) {
      return false
    }

    if (user.confirmed) {
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

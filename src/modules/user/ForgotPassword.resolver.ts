import { v4 } from 'uuid'
import { Arg, Mutation, Resolver } from 'type-graphql'

import { redis } from '../../redis'
import { User } from '../../entity/User.entity'
import { MailType, sendEmail } from '../utils/sendEmail'
import { forgotPasswordPrefix } from '../constants/redisPrefixes'
import { getOriginEndPoint } from '../../utils/getOriginEndpoint'

@Resolver()
export class ForgotPasswordResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string): Promise<boolean> {
    const [user] = await User.find({ where: { email }, take: 1 })

    if (!user) {
      return true
    }

    const token = v4()
    await redis.set(forgotPasswordPrefix + token, user.id, 'ex', 60 * 60 * 24) // 1 day expiration

    sendEmail(
      user.email,
      `${getOriginEndPoint()}/user/change-password/${token}`,
      MailType.ForgotPasswordEmail
    )

    return true
  }
}

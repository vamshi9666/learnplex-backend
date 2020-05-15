import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'

import { redis } from '../../redis'
import { User } from '../../entity/User.entity'
import { confirmUserPrefix } from '../constants/redisPrefixes'
import {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} from '../../utils/auth'
import { MyContext } from '../../types/MyContext'
import { LoginResponse } from './login/LoginResponse'

@Resolver()
export class ConfirmUserResolver {
  @Mutation(() => LoginResponse)
  async confirmUser(
    @Arg('token') token: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const userId = await redis.get(confirmUserPrefix + token)

    if (!userId) {
      throw new Error('invalid token')
    }

    await User.update({ id: parseInt(userId) }, { confirmed: true })
    await redis.del(confirmUserPrefix + token)
    const [user] = await User.find({ where: { id: userId } })

    sendRefreshToken(res, createRefreshToken(user))
    sendAccessToken(res, createAccessToken(user.id))
    return { accessToken: createAccessToken(user.id), user }
  }
}

import { compare } from 'bcryptjs'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'

import { User } from '../../entity/User.entity'
import {
  sendRefreshToken,
  createRefreshToken,
  createAccessToken,
  sendAccessToken,
} from '../../utils/auth'
import { MyContext } from '../../types/MyContext'
import { LoginResponse } from './login/LoginResponse'

@Resolver()
export class LoginResolver {
  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const [user] = await User.find({ where: { email }, take: 1 })

    if (!user) {
      throw new Error('Could not find user.')
    }

    const valid = await compare(password, user.password)

    if (!valid) {
      throw new Error('Email vs Password mismatch.')
    }

    if (!user.confirmed) {
      throw new Error('Email is not yet confirmed.')
    }

    sendRefreshToken(res, createRefreshToken(user))
    sendAccessToken(res, createAccessToken(user.id))
    return { accessToken: createAccessToken(user.id), user }
  }
}

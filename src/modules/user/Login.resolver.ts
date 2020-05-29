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
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    let user
    const [userWithEmail] = await User.find({
      where: { email: usernameOrEmail },
      take: 1,
    })

    if (!userWithEmail) {
      const [userWithUsername] = await User.find({
        where: { username: usernameOrEmail },
      })
      if (!userWithUsername) {
        throw new Error('Could not find user.')
      }
      user = userWithUsername
    } else {
      user = userWithEmail
    }

    const valid = await compare(password, user.password)

    if (!valid) {
      throw new Error('Email/Username vs Password mismatch.')
    }

    sendRefreshToken(res, createRefreshToken(user))
    sendAccessToken(res, createAccessToken(user.id))
    return { accessToken: createAccessToken(user.id), user }
  }
}

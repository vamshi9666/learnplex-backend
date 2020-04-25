import { Ctx, Query, Resolver, UseMiddleware } from 'type-graphql'

import { MyContext } from '../../types/MyContext'
import { User } from '../../entity/User.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { UserRole } from '../../entity/enums/UserRole.enum'
import { hasRole } from '../middleware/hasRole'
import { LoginResponse } from './login/LoginResponse'
import { createAccessToken } from '../../utils/auth'

@Resolver()
export class MeResolver {
  @UseMiddleware(isAuthorized, hasRole([UserRole.USER]))
  @Query(() => LoginResponse)
  async me(@Ctx() { payload }: MyContext): Promise<LoginResponse> {
    const [user] = await User.find({
      where: { id: payload!.userId },
      take: 1,
    })
    return { accessToken: createAccessToken(user.id), user }
  }
}

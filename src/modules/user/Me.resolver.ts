import { Ctx, Query, Resolver, UseMiddleware } from 'type-graphql'

import { MyContext } from '../../types/MyContext'
import { User } from '../../entity/User.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { UserRole } from '../../entity/enums/UserRole.enum'
import { hasRole } from '../middleware/hasRole'

@Resolver()
export class MeResolver {
  @UseMiddleware(isAuthorized, hasRole([UserRole.USER]))
  @Query(() => User, { nullable: true })
  async me(@Ctx() { payload }: MyContext): Promise<User | undefined> {
    try {
      const [user] = await User.find({
        where: { id: payload!.userId },
        take: 1,
      })
      return user
    } catch (e) {
      console.error(e)
      return undefined
    }
  }
}

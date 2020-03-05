import { Ctx, Query, Resolver, UseMiddleware } from 'type-graphql'

import { User } from '../../entity/User.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { MyContext } from '../../types/MyContext'
import { UserRole } from '../../entity/user/UserRole.enum'
import { hasRole } from '../middleware/hasRole'

@Resolver()
export class UsersResolver {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  @UseMiddleware(isAuthorized, hasRole([UserRole.USER]))
  @Query(() => String)
  hello(@Ctx() { payload }: MyContext) {
    return `your user id is ${payload!.userId}`
  }

  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find()
  }
}

import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql'

import { User } from '../../entity/User.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { MyContext } from '../../types/MyContext'
import { UserRole } from '../../entity/enums/UserRole.enum'
import { hasRole } from '../middleware/hasRole'

@Resolver()
export class UsersResolver {
  @Query(() => String)
  hello() {
    return 'Hello'
  }

  @UseMiddleware(isAuthorized, hasRole([UserRole.USER]))
  @Query(() => String)
  bye(@Ctx() { payload }: MyContext) {
    return `your user id is ${payload!.userId}`
  }

  @Query(() => [User])
  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  users(): Promise<User[]> {
    return User.find()
  }

  @Mutation(() => Boolean)
  async validateEmail(@Arg('email') email: string): Promise<boolean> {
    const [user] = await User.find({ where: { email } })
    return !user
  }

  @Mutation(() => Boolean)
  async validateUsername(@Arg('username') username: string): Promise<boolean> {
    const [user] = await User.find({ where: { username } })
    return !user
  }
}

import { Ctx, Mutation, Resolver } from 'type-graphql'

import { MyContext } from '../../types/MyContext'

@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext): Promise<boolean> {
    res.clearCookie(process.env.REFRESH_COOKIE_NAME as string)
    res.clearCookie(process.env.ACCESS_COOKIE_NAME as string)
    return true
  }
}

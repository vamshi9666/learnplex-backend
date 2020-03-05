import { Ctx, Mutation, Resolver } from 'type-graphql'

import { MyContext } from '../../types/MyContext'
import { sendRefreshToken } from '../../utils/auth'

@Resolver()
export class LogoutResolver {
  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: MyContext): Promise<boolean> {
    await sendRefreshToken(res, '')
    return true
  }
}

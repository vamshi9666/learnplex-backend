import { getConnection } from 'typeorm'
import { Arg, Mutation, Resolver } from 'type-graphql'

import { User } from '../../entity/User.entity'

@Resolver()
export class RevokeTokensForUserResolver {
  @Mutation(() => Boolean)
  async revokeTokensForUser(@Arg('userId') userId: number): Promise<boolean> {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, 'tokenVersion', 1)
    return true
  }
}

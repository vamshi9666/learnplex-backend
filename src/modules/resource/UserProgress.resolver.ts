import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Progress } from '../../entity/Progress.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { User } from '../../entity/User.entity'
import CurrentUser from '../../decorators/currentUser'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'

@Resolver()
export class UserProgressResolver {
  @Query(() => Progress, { nullable: true })
  @UseMiddleware(isAuthorized)
  async userProgress(
    @Arg('resourceSlug') resourceSlug: string,
    @CurrentUser() currentUser: User
  ): Promise<Progress | null> {
    const resource = await getResource(currentUser.username, resourceSlug)
    if (!resource) {
      return null
    }
    const [progress] = await Progress.find({
      where: { user: currentUser, resource },
    })
    return progress
  }
}

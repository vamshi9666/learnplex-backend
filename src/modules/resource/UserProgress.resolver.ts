import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql'

import { Progress } from '../../entity/Progress.entity'
import { isAuthorized } from '../middleware/isAuthorized'
import { User } from '../../entity/User.entity'
import CurrentUser from '../../decorators/currentUser'
import { getResource } from '../utils/getResourceFromUsernameAndSlug'
import { Resource } from '../../entity/Resource.entity'

@Resolver()
export class UserProgressResolver {
  @Query(() => Progress, { nullable: true })
  @UseMiddleware(isAuthorized)
  async userProgress(
    @Arg('resourceSlug') resourceSlug: string,
    @Arg('ownerUsername') ownerUsername: string,
    @CurrentUser() currentUser: User
  ): Promise<Progress | null> {
    const resource = await getResource(ownerUsername, resourceSlug)
    if (!resource) {
      return null
    }
    const [progress] = await Progress.find({
      where: { user: currentUser, resource },
    })
    return progress
  }

  @Query(() => [Progress])
  @UseMiddleware(isAuthorized)
  async userProgressList(
    @CurrentUser() currentUser: User
  ): Promise<Progress[]> {
    return Progress.find({ where: { user: currentUser } })
  }

  @Query(() => Boolean)
  @UseMiddleware(isAuthorized)
  async hasEnrolled(
    @Arg('username') username: string,
    @Arg('resourceSlug') resourceSlug: string,
    @CurrentUser() currentUser: User
  ): Promise<boolean> {
    const resource = await getResource(username, resourceSlug)
    if (!resource) {
      throw new Error('Invalid Resource')
    }
    const [progress] = await Progress.find({
      where: { resource, user: currentUser },
    })
    return !!progress
  }

  @Query(() => Boolean)
  @UseMiddleware(isAuthorized)
  async hasEnrolledByResourceId(
    @Arg('resourceId') resourceId: string,
    @CurrentUser() currentUser: User
  ): Promise<boolean> {
    const [resource] = await Resource.find({ where: { id: resourceId } })
    if (!resource) {
      throw new Error('Invalid Resource')
    }
    const [progress] = await Progress.find({
      where: { resource, user: currentUser },
    })
    return !!progress
  }
}

import { Arg, Mutation, UseMiddleware } from 'type-graphql'
import { hash } from 'bcryptjs'

import { isAuthorized } from '../middleware/isAuthorized'
import { UpdateUserInput } from './register/UpdateUserInput'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { MailType, sendEmail } from '../utils/sendEmail'
import { createConfirmationUrl } from '../utils/createConfirmationUrl'
import { PasswordInput } from '../shared/PasswordInput'

export class UpdateUserResolver {
  @Mutation(() => Boolean)
  @UseMiddleware(isAuthorized)
  async updateUser(
    @Arg('data') { name, email, username }: UpdateUserInput,
    @CurrentUser() currentUser: User
  ) {
    if (
      currentUser.name === name &&
      currentUser.email === email &&
      currentUser.username === username
    ) {
      return true
    }
    if (currentUser.email !== email) {
      const [user] = await User.find({ where: { email } })
      if (user) {
        throw new Error('Email already exists')
      }
      currentUser.confirmed = false
    }
    if (currentUser.username !== username) {
      const [user] = await User.find({ where: { username } })
      if (user) {
        throw new Error('Username already exists')
      }
    }
    currentUser.name = name
    currentUser.email = email
    currentUser.username = username
    await currentUser.save()
    sendEmail(
      email,
      await createConfirmationUrl(currentUser.id),
      MailType.ConfirmationEmail
    )
    return true
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuthorized)
  async updatePassword(
    @Arg('data') { password }: PasswordInput,
    @CurrentUser() currentUser: User
  ) {
    currentUser.password = await hash(password, 12)
    await currentUser.save()
    return true
  }
}

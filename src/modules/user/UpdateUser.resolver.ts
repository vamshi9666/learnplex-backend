import { Arg, Mutation, UseMiddleware } from 'type-graphql'
import { compare, hash } from 'bcryptjs'

import { isAuthorized } from '../middleware/isAuthorized'
import { UpdateUserInput } from './register/UpdateUserInput'
import CurrentUser from '../../decorators/currentUser'
import { User } from '../../entity/User.entity'
import { MailType, sendEmail } from '../utils/sendEmail'
import { createConfirmationUrl } from '../utils/createConfirmationUrl'
import { UpdatePasswordInput } from './register/UpdatePasswordInput'
import { hasRole } from '../middleware/hasRole'
import { UserRole } from '../../entity/enums/UserRole.enum'
import { UpdateUserOptionalInput } from './register/UpdateUserOptionalInput'

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
    @Arg('data') { password, currentPassword }: UpdatePasswordInput,
    @CurrentUser() currentUser: User
  ) {
    if (!(await compare(currentPassword, currentUser.password))) {
      return false
    }
    currentUser.password = await hash(password, 12)
    await currentUser.save()
    return true
  }

  @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
  @Mutation(() => Boolean)
  async updateUserDetailsAsAdmin(
    @Arg('data')
    { name, email, username, currentUsername }: UpdateUserOptionalInput
  ) {
    const [currentUser] = await User.find({
      where: { username: currentUsername },
    })
    if (!currentUser) {
      throw new Error('Invalid user')
    }
    if (email && currentUser.email !== email) {
      const [user] = await User.find({ where: { email } })
      if (user) {
        throw new Error('Email already exists')
      }
      currentUser.email = email
      currentUser.confirmed = false
      sendEmail(
        email,
        await createConfirmationUrl(currentUser.id),
        MailType.ConfirmationEmail
      )
    }
    if (username && currentUser.username !== username) {
      const [user] = await User.find({ where: { username } })
      if (user) {
        throw new Error('Username already exists')
      }
      currentUser.username = username
    }
    if (name) {
      currentUser.name = name
    }
    await currentUser.save()
    return true
  }
}

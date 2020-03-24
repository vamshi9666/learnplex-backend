import { buildSchema } from 'type-graphql'

import { ChangePasswordResolver } from '../modules/user/ChangePassword.resolver'
import { ConfirmUserResolver } from '../modules/user/ConfirmUser.resolver'
import { ForgotPasswordResolver } from '../modules/user/ForgotPassword.resolver'
import { LoginResolver } from '../modules/user/Login.resolver'
import { LogoutResolver } from '../modules/user/Logout.resolver'
import { MeResolver } from '../modules/user/Me.resolver'
import { RegisterResolver } from '../modules/user/Register.resolver'
import { RevokeTokensForUserResolver } from '../modules/user/RevokeTokensForUserResolver'
import { UsersResolver } from '../modules/user/Users.Resolver'
import { GraphQLSchema } from 'graphql'
import { SendConfirmationMailResolver } from '../modules/user/SendConfirmationMail.resolver'
import { CreateTopicResolver } from '../modules/resource/CreateTopic.resolver'
import { TopicsResolver } from '../modules/resource/Topics.resolver'
import { CreateResourceResolver } from '../modules/resource/CreateResource.resolver'
import { AddSectionResolver } from '../modules/resource/AddSection.resolver'
import { ResourcesResolver } from '../modules/resource/Resources.resolver'
import { SectionsResolver } from '../modules/resource/Sections.resolver'
import { AddSubSectionResolver } from '../modules/resource/AddSubSection.resolver'
import { UpdateSectionResolver } from '../modules/resource/UpdateSection.resolver'
import { DeleteSectionResolver } from '../modules/resource/DeleteSection.resolver'

export const createSchema: () => Promise<GraphQLSchema> = () =>
  buildSchema({
    resolvers: [
      ChangePasswordResolver,
      ConfirmUserResolver,
      ForgotPasswordResolver,
      LoginResolver,
      LogoutResolver,
      MeResolver,
      RegisterResolver,
      RevokeTokensForUserResolver,
      UsersResolver,
      SendConfirmationMailResolver,
      CreateTopicResolver,
      TopicsResolver,
      CreateResourceResolver,
      ResourcesResolver,
      AddSectionResolver,
      SectionsResolver,
      AddSubSectionResolver,
      UpdateSectionResolver,
      DeleteSectionResolver,
    ],
    authChecker: ({ context: { req } }) => {
      return !!req.userId
    },
  })

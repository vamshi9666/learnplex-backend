import { registerEnumType } from 'type-graphql'

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

registerEnumType(UserRole, {
  name: 'UserRole'
})

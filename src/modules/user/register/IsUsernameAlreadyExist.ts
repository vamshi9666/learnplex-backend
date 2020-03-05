import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'

import { User } from '../../../entity/User.entity'

@ValidatorConstraint({ async: true })
export class IsUsernameAlreadyExistConstraint
  implements ValidatorConstraintInterface {
  validate(username: string): Promise<boolean> {
    return User.find({ where: { username }, take: 1 }).then(([user]) => {
      return !user
    })
  }
}

export function IsUsernameAlreadyExist(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function(object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameAlreadyExistConstraint
    })
  }
}

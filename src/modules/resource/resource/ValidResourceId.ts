import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'

import { Resource } from '../../../entity/Resource.entity'

@ValidatorConstraint({ async: true })
export class ValidResourceIdConstraint implements ValidatorConstraintInterface {
  validate(id: string): Promise<boolean> {
    return Resource.find({ where: { id }, take: 1 }).then(
      ([resource]: Resource[]) => {
        return !!resource
      }
    )
  }
}

export function ValidResourceId(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: ValidResourceIdConstraint
    })
  }
}

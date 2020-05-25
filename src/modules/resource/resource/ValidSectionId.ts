import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { Section } from '../../../entity/Section.entity'

@ValidatorConstraint({ async: true })
export class ValidSectionIdConstraint implements ValidatorConstraintInterface {
  validate(id: string): Promise<boolean> {
    return Section.find({ where: { id, deleted: false }, take: 1 }).then(
      ([section]: Section[]) => {
        return !!section
      }
    )
  }
}

export function ValidSectionId(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: ValidSectionIdConstraint,
    })
  }
}

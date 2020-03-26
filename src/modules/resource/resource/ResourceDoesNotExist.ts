import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { slug } from '../../../utils/slug'
import { Resource } from '../../../entity/Resource.entity'

@ValidatorConstraint({ async: true })
export class ResourceDoesNotExistConstraint
  implements ValidatorConstraintInterface {
  async validate(title: string): Promise<boolean> {
    return Resource.find().then((resources: Resource[]) => {
      return !resources.some((resource) => resource.slug === slug(title))
    })
  }
}

export function ResourceDoesNotExist(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: ResourceDoesNotExistConstraint,
    })
  }
}

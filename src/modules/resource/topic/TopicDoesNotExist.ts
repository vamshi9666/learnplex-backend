import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { Topic } from '../../../entity/Topic.entity'
import { slug } from '../../../utils/slug'

@ValidatorConstraint({ async: true })
export class TopicDoesNotExistConstraint
  implements ValidatorConstraintInterface {
  validate(title: string): Promise<boolean> {
    return Topic.find().then((topics: Topic[]) => {
      return !topics.some((topic) => topic.slug === slug(title))
    })
  }
}

export function TopicDoesNotExist(validationOptions?: ValidationOptions) {
  return function(object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: TopicDoesNotExistConstraint,
    })
  }
}

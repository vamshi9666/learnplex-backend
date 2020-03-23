import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'

import { slug } from '../../../utils/slug'
import { Section } from '../../../entity/Section.entity'
import { Resource } from '../../../entity/Resource.entity'

@ValidatorConstraint({ async: true })
export class SectionDoesNotExistConstraint
  implements ValidatorConstraintInterface {
  async validate(title: string, args: ValidationArguments): Promise<boolean> {
    const [relatedPropertyName] = args.constraints
    if (relatedPropertyName === 'resourceId') {
      const resourceId = (args.object as any)[relatedPropertyName]
      const [resource] = await Resource.find({
        where: { id: resourceId },
        take: 1
      })
      const sections = (await resource?.sections) ?? []
      return !sections.some((section) => section.slug() === slug(title))
    } else if (relatedPropertyName === 'sectionId') {
      const sectionId = (args.object as any)[relatedPropertyName]
      const [section] = await Section.find({
        where: { id: sectionId },
        take: 1
      })
      const subSections = (await section?.sections) ?? []
      return !subSections.some(
        (subSection) => subSection.slug() === slug(title)
      )
    }
    return true
  }
}

export function SectionDoesNotExist(
  propoerty: string,
  validationOptions?: ValidationOptions
) {
  return function(object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [propoerty],
      validator: SectionDoesNotExistConstraint
    })
  }
}

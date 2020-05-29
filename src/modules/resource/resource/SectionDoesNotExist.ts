import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { slug } from '../../../utils/slug'
import { Section } from '../../../entity/Section.entity'

@ValidatorConstraint({ async: true })
export class SectionDoesNotExistConstraint
  implements ValidatorConstraintInterface {
  async validate(title: string, args: ValidationArguments): Promise<boolean> {
    const [relatedPropertyName] = args.constraints
    let subSections
    if (relatedPropertyName === 'sectionId') {
      const sectionId = (args.object as any)[relatedPropertyName]
      const [section] = await Section.find({
        where: { id: sectionId, deleted: false },
        take: 1,
      })
      const parentSection = await section.parentSection
      subSections = (await parentSection.sections).filter(
        (section) => section.id !== sectionId
      )
    } else if (relatedPropertyName === 'parentSectionId') {
      const parentSectionId = (args.object as any)[relatedPropertyName]
      const [parentSection] = await Section.find({
        where: { id: parentSectionId },
        take: 1,
      })
      subSections = await parentSection.sections
    }
    return !subSections?.some((subSection) => subSection.slug === slug(title))
  }
}

export function SectionDoesNotExist(
  propoerty: string,
  validationOptions?: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [propoerty],
      validator: SectionDoesNotExistConstraint,
    })
  }
}

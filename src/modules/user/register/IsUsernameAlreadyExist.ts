import {registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from "class-validator";

import {User} from "../../../entity/User.entity";

@ValidatorConstraint({ async: true })
export class IsUsernameAlreadyExistConstraint implements ValidatorConstraintInterface {

    validate(username: string) {
        return User.find({ where: { username }, take: 1 }).then(([user]) => {
            return !user;
        })
    }

}

export function IsUsernameAlreadyExist(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUsernameAlreadyExistConstraint
        });
    };
}

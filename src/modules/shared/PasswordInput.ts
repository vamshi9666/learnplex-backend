import {Field, InputType} from "type-graphql";
import {MinLength} from "class-validator";

@InputType({ isAbstract: true })
export class PasswordInput {

    @Field()
    @MinLength(5)
    password: string;

}

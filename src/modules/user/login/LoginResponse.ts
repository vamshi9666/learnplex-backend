import {Field, ObjectType} from "type-graphql";

import {User} from "../../../entity/User.entity";

@ObjectType()
export class LoginResponse {
    @Field()
    accessToken: string;

    @Field()
    user: User;
}

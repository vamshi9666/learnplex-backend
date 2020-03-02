import {Arg, Mutation, Query, Resolver, UseMiddleware} from "type-graphql";
import bcrypt from 'bcryptjs';

import {User} from "../../entity/User";
import {RegisterInput} from "./Register/RegisterInput";
import {isAuth} from "../middleware/isAuth";

@Resolver()
export class RegisterResolver {

    @UseMiddleware(isAuth)
    @Query(() => String )
    async hello() {
        return "Hello World"
    }

    @Mutation(() => User )
    async register(
        @Arg("data") {firstName, lastName, email, password}: RegisterInput
    ): Promise<User> {
        const hashedPassword: string = await bcrypt.hash(password, 12);

        const user: User = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        }).save();

        return user;
    }

}

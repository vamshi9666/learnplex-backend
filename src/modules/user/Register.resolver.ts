import { hash } from 'bcryptjs';
import {Arg, Ctx, Mutation, Query, Resolver, UseMiddleware} from "type-graphql";

import {User} from "../../entity/User";
import {RegisterInput} from "./Register/RegisterInput";
import {isAuth} from "../middleware/isAuth";
import {MyContext} from "../../types/MyContext";

@Resolver()
export class RegisterResolver {

    @UseMiddleware(isAuth)
    @Query(() => String )
    async hello(
        @Ctx() {payload}: MyContext
    ) {
        return `your user id is ${payload!.userId}`
    }

    @Mutation(() => Boolean )
    async register(
        @Arg("data") {firstName, lastName, email, password, username}: RegisterInput
    ): Promise<boolean> {
        const hashedPassword: string = await hash(password, 12);

        try {
            await User.insert({
                firstName,
                lastName,
                email,
                username,
                password: hashedPassword
            });
        } catch (e) {
            console.error(e);
            return false;
        }

        return true;
    }

}

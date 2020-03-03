import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import bcrypt from "bcryptjs";

import {User} from "../../entity/User";
import {MyContext} from "../../types/MyContext";

@Resolver()
export class LoginResolver {

    @Mutation(() => User, { nullable: true } )
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() ctx: MyContext
    ): Promise<User | null> {
        const [user] = await User.find({ where: { email }, take: 1 });

        if (!user) {
            throw new Error('User with that email does not exist');
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            throw new Error('Email and password does not match');
        }

        if (!user.confirmed) {
            throw new Error('Please confirm your email before logging in')
        }

        ctx.req.session!.userId = user.id;

        return user
    }

}

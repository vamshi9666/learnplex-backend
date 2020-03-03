import {Arg, Ctx, Mutation, Resolver} from "type-graphql";
import bcrypt from "bcryptjs";

import {User} from "../../entity/User";
import {ChangePasswordInput} from "./changePassword/ChangePasswordInput";
import {forgotPasswordPrefix} from "../constants/redisPrefixes";
import {redis} from "../../redis";
import {MyContext} from "../../types/MyContext";
import {sendRefreshToken, createRefreshToken} from "../../utils/auth";

@Resolver()
export class ChangePasswordResolver {

    @Mutation(() => User, { nullable: true })
    async changePassword(
        @Arg("data") { token, password }: ChangePasswordInput,
        @Ctx() ctx: MyContext
    ): Promise<User | null> {
        const userId = await redis.get(forgotPasswordPrefix + token);

        if (!userId) {
            return null;
        }

        const [user] = await User.find({ where: { id: userId }, take: 1 });

        if (!user) {
            return null;
        }

        await redis.del(forgotPasswordPrefix + token);

        user.password = await bcrypt.hash(password, 12);
        await user.save();

        sendRefreshToken(ctx.res, createRefreshToken(user));

        return user;
    }

}

import bcrypt from "bcryptjs";
import {Arg, Ctx, Mutation, Resolver} from "type-graphql";

import {User} from "../../entity/User";
import {MyContext} from "../../types/MyContext";
import {createCookiesAndLogin, createTokens} from "../../utils/auth";

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
            return null
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return null
        }

        if (!user.confirmed) {
            return null
        }

        const { refreshToken, accessToken } = createTokens(user);
        createCookiesAndLogin(ctx, refreshToken, accessToken, user.id);
        (ctx.req as any).userId = user.id;

        return user
    }

}

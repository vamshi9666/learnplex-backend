import {Ctx, Query, Resolver, UseMiddleware} from "type-graphql";

import {MyContext} from "../../types/MyContext";
import {User} from "../../entity/User";
import {isAuth} from "../middleware/isAuth";

@Resolver()
export class MeResolver {

    @UseMiddleware(isAuth)
    @Query(() => User, { nullable: true } )
    async me(@Ctx() { payload }: MyContext): Promise<User | undefined> {

        try {
            const [user] = await User.find({ where: { id: payload!.userId }, take: 1 });
            return user;
        } catch (e) {
            console.error(e);
            return undefined;
        }
    }
}

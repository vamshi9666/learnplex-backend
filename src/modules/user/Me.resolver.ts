import {Ctx, Query, Resolver} from "type-graphql";

import {MyContext} from "../../types/MyContext";
import {User} from "../../entity/User";

@Resolver()
export class MeResolver {

    @Query(() => User, { nullable: true } )
    async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
        if (!(req as any).userId) {
            return undefined
        }

        const [user] = await User.find({ where: { id: (req as any).userId } });
        return user;
    }
}

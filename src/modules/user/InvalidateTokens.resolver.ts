import {Ctx, Mutation, Resolver} from "type-graphql";

import {User} from "../../entity/User";
import {MyContext} from "../../types/MyContext";

@Resolver()
export class InvalidateTokensResolver {

    @Mutation(() => Boolean)
    async invalidateTokens(@Ctx() { req }: MyContext): Promise<boolean> {
        if (!(req as any).userId) {
            return false;
        }

        const [user] = await User.find({ where: { id: (req as any).userId } });
        if (!user) {
            return false;
        }
        user.refreshTokenCount += 1;
        await user.save();

        return true;
    }

}

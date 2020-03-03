import {Ctx, Mutation, Resolver} from "type-graphql";
import {MyContext} from "../../types/MyContext";

@Resolver()
export class LogoutResolver {
    @Mutation(() => Boolean)
    async logout(@Ctx() ctx: MyContext): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                (ctx.req as any).userId = null;
                ctx.res.clearCookie('refresh-token');
                ctx.res.clearCookie('access-token');
                resolve(true);
            } catch {
                reject(false);
            }
        })
    }
}

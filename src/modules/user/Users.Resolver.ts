import {Ctx, Query, Resolver, UseMiddleware} from "type-graphql";

import {User} from "../../entity/User.entity";
import {isAuthorized} from "../middleware/isAuthorized";
import {MyContext} from "../../types/MyContext";
import {UserRole} from "../../entity/user/UserRole.enum";
import {hasRole} from "../middleware/hasRole";

@Resolver()
export class UsersResolver {

    @UseMiddleware(isAuthorized, hasRole([UserRole.USER]))
    @Query(() => String )
    async hello(
        @Ctx() {payload}: MyContext
    ) {
        return `your user id is ${payload!.userId}`
    }

    @UseMiddleware(isAuthorized, hasRole([UserRole.ADMIN]))
    @Query(() => [User])
    async users(): Promise<User[]> {
        return await User.find()
    }
}

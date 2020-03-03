import {sign} from "jsonwebtoken";
import ms from "ms";

import {User} from "../entity/User";
import {MyContext} from "../types/MyContext";
import {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} from "../constants";

export const createTokens = (user: User) => {
    const refreshToken = sign({ userId: user.id, count: user.refreshTokenCount },
        REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    const accessToken = sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    return { refreshToken, accessToken };
};

export const createCookiesAndLogin = (ctx: MyContext, refreshToken: string, accessToken: string, userId: number) => {
    ctx.res.cookie("refresh-token", refreshToken, { maxAge: ms("7d") });
    ctx.res.cookie("access-token", accessToken, { maxAge: ms("15m") });
    (ctx.req as any).userId = userId;
};

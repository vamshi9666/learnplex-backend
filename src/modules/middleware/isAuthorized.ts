import {MiddlewareFn} from "type-graphql";
import {verify} from "jsonwebtoken";

import {MyContext} from "../../types/MyContext";

export const isAuthorized: MiddlewareFn<MyContext> = async ({ context }, next) => {
    const authorization = context.req.headers['authorization'] as string;

    if (!authorization) {
        throw new Error('not authenticated');
    }

    try {
        const token = authorization.split(" ")[1];
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        context.payload = payload as any;
    } catch (e) {
        console.error(e);
        throw new Error('not authenticated');
    }

    return next();
};

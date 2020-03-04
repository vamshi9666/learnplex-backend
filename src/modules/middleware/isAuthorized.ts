import {MiddlewareFn} from "type-graphql";
import {verify} from "jsonwebtoken";

import {MyContext} from "../../types/MyContext";

export const getAuthorizationPayloadFromToken = (context: MyContext) => {
    const authorization = context.req.headers['authorization'] as string;

    if (!authorization) {
        throw new Error('not authenticated');
    }

    let payload;

    try {
        const token = authorization.split(" ")[1];
        payload = verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
    } catch (e) {
        console.error(e);
        throw new Error('not authenticated');
    }

    return payload;
};

export const isAuthorized: MiddlewareFn<MyContext> = async ({ context }, next) => {
    context.payload = getAuthorizationPayloadFromToken(context);
    return next();
};

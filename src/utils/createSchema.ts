import {buildSchema} from "type-graphql";
import {ChangePasswordResolver} from "../modules/user/ChangePassword.resolver";
import {ConfirmUserResolver} from "../modules/user/ConfirmUser.resolver";
import {ForgotPasswordResolver} from "../modules/user/ForgotPassword.resolver";
import {LoginResolver} from "../modules/user/Login.resolver";
import {LogoutResolver} from "../modules/user/Logout.resolver";
import {MeResolver} from "../modules/user/Me.resolver";
import {RegisterResolver} from "../modules/user/Register.resolver";
import {RevokeTokensForUserResolver} from "../modules/user/RevokeTokensForUserResolver";

export const createSchema = () => buildSchema({
    resolvers: [
        ChangePasswordResolver,
        ConfirmUserResolver,
        ForgotPasswordResolver,
        LoginResolver,
        LogoutResolver,
        MeResolver,
        RegisterResolver,
        RevokeTokensForUserResolver
    ],
    authChecker: ({ context: { req } }) => {
        return !!req.userId;
    }
});

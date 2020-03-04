import {Arg, Mutation, Resolver} from "type-graphql";

import {User} from "../../entity/User.entity";
import {RegisterInput} from "./Register/RegisterInput";
import {sendEmail} from "../utils/sendEmail";
import {createConfirmationUrl} from "../utils/createConfirmationUrl";

@Resolver()
export class RegisterResolver {
    @Mutation(() => Boolean )
    async register(
        @Arg("data") {firstName, lastName, email, password, username}: RegisterInput
    ): Promise<boolean> {
        let user;

        try {
            user = await User.create({
                firstName,
                lastName,
                email,
                username,
                password // hashing this in @BeforeInsert hook in User.entity.ts
            }).save();
        } catch (e) {
            console.error(e);
            return false;
        }

        await sendEmail(email, await createConfirmationUrl(user.id));

        return true;
    }

}

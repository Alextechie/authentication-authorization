import { compare, generateAccessToken, generateRefreshToken, hash } from "../../utils/lib";
import type { User } from "../../utils/types"
import { createUser, findUser } from "./auth.model";
import { serializerForToken, serializerForUser } from "../../utils/serializers";
import type { SafeUserProfile, TokenPayload } from "../../core/types/auth";
import { access_token_exp, refresh_token_exp } from "../../utils/env";

export const Authservice = {
    async registerUser(data: User): Promise<{ user: SafeUserProfile, access_token: string }> {
        const { email, password } = data;

        // check if user exists
        const exists = await findUser(email);

        if (exists) {
            throw new Error("User already exists")
        }

        // hash the password and create a new user
        const hashed = await hash(password);

        // call the register user method in the auth service
        const user = await createUser({ ...data, password: hashed });


        const permissions = user.role.permissions.map((rp) => rp.permission.action);

        console.log(permissions)

        const payload: TokenPayload = serializerForToken(user)

        // sign jwt with the payload and secret
        const access_token = await generateAccessToken(payload)

        // send an email / sms

        return {
            user: serializerForUser(user),
            access_token
        }
    },

    async loginUser(email: string, password: string): Promise<{user: SafeUserProfile, access_token: string, refresh_token: string}> {
        const user = await findUser(email);

        if (!user) {
            throw new Error("User does not exist")
        }

        // compare the passwords
        const comparePass = await compare(password, user.password);

        if (!comparePass) {
            throw new Error("The passwords don't match")
        }

        const payload: TokenPayload = serializerForToken(user)

        // sign the jwt with a secret and payload
        const access_token = await generateAccessToken(payload);


        const refresh_token = await generateRefreshToken({id: user.id});

        // send an email if login attempts are many without correct password

        // return the access_token and user
        return {
            user: serializerForUser(user),
            access_token,
            refresh_token
        }
    }
}
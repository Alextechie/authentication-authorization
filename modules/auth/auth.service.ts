import { compare, generateAccessToken, generateRefreshToken, hash } from "../../utils/lib";
import type { User } from "../../utils/types"
import { createUser, findUser, updateUserPassword, verification } from "./auth.model";
import { serializerForToken, serializerForUser } from "../../utils/serializers";
import type { SafeUserProfile, TokenPayload } from "../../core/types/auth";
import crypto from "crypto";

export const Authservice = {
    async registerUser(data: User): Promise<{ user: SafeUserProfile, access_token: string, verificationUrl: string }> {
        const { email, password } = data;

        // check if user exists
        const exists = await findUser(email);

        if (exists) {
            throw new Error("User already exists")
        }

        // hash the password and create a new user
        const hashed = await hash(password);



        // call the register user method in the auth service
        const user = await createUser({ ...data, password: hashed});

        // generate verification token
        // set the expiry for the verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() +  1000 * 60 * 15);

        // hash the verification token
        const hashedToken = await hash(verificationToken);

        await verification(user.id, hashedToken, verificationTokenExpiry);

        const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${encodeURIComponent(verificationToken)}&id=${user.id}`;

        const permissions = user.role.permissions.map((rp) => rp.permission.action);

        console.log(permissions)

        const payload: TokenPayload = serializerForToken(user)

        // sign jwt with the payload and secret
        const access_token = await generateAccessToken(payload)

        return {
            user: serializerForUser(user),
            access_token,
            verificationUrl
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
    },

    async passwordReset(email: string, password: string){
        // find the user with particular email
        // reset the password
        const user = await findUser(email);

        if(!user){
            throw new Error("User does not exist")
        };

        // reset the password
        // hash the new password
        // update the password for the user with that email

        // optional: send user a notification of the secret to use to update profile
        // optional: send user a notification after successfuly changing the password
        const hashed = await hash(password);

        const updatedProfile = await updateUserPassword(hashed, user.email);

        return {
            username: updatedProfile.username,
            email: updatedProfile.email,
            role: updatedProfile.role.permissions
        }
    },

    async verifyEmail(email: string){
        // get the user with that email
        // send them an otp to verify that indeed that their real email
        // user enter otp and verify the otp and send login the user 

        const user = await findUser(email);

        if(!user){
            throw new Error("User does not exist")
        };

        // send them an email or notification with the otp
        // verify the otp and login the user

    }
}
import { password } from "bun";
import z from "zod";

export const user_schema = z.object({
    username: z.string().min(4, "Username should have atleast 4 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password should have atleast 8 chars")
});

export const login_schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password should have atleast 8 chars")
});


export const reset_password_schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password should have atleast 8 chars"),
    confirm_password: z.string().min(8, "Password should have 8 chars")
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"] // sets the path for the error
})
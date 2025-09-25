import z from "zod";

export const user_schema = z.object({
    username: z.string().min(4, "Username should have atleast 4 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password should have atleast 8 chars")
});

export const login_schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password should have atleast 8 chars")
})
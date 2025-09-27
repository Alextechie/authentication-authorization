import nodemailer from "nodemailer";
import type { EmailProps } from "../../../utils/types";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendEmail(data: EmailProps): Promise<string> {
    try{
        const email = await transporter.sendMail({
            from: `'Soft' <${process.env.EMAIL_USER}>`,
            to: data.to,
            subject: data.subject,
            html: data.html
        });

        return email.response
    } catch(err){
        throw new Error(`Error sending email: ${err}`);
    }
}
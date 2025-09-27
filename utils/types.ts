import { serializerForToken, serializerForUser } from "./serializers";

export interface User {
    username: string;
    email: string;
    password: string;
};


export interface EmailProps {
    to: string;
    subject: string;
    html: HTMLDivElement;
    link?: string;
};


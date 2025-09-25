import { serializerForToken, serializerForUser } from "./serializers";

export interface User {
    username: string;
    email: string;
    password: string;
};


export interface UserDB {
    id: string;
    username: string;
    email: string;
    role: {name: string};
    password: string;
    createdAt: Date;
    updatedAt: Date;
};

export interface SafeUserProfile {
    id: string;
    username: string;
    email: string;
    role: {name: string};
    createdAt: Date;
};

export interface TokenPayload {
    id: string;
    role: {name: string},
    permissions: string[]
};

export interface AdminProfile extends SafeUserProfile {
    updatedAt: Date;
}
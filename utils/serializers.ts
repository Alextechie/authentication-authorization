import type { AdminProfile, SafeUserProfile, TokenPayload, UserDB } from "../core/types/auth";

export const serializerForToken = (user: UserDB): TokenPayload => {
    if (!user) {
        throw new Error("User does not exist");
    };

    return {
        id: user.id,
        role: user.role,
        permissions: user
    }
};

export const serializerForUser = (user: UserDB): SafeUserProfile => {
    if (!user) {
        throw new Error("User does not exist");
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        createdAt: user.createdAt
    }
};


export const serializeForAdmin = (user: UserDB): AdminProfile => {
    if (!user) {
        throw new Error("User does not exist");
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
}
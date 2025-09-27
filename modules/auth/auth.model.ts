import { connect } from "bun";
import prisma from "../../utils/prisma";
import type { User } from "../../utils/types";
import { string } from "zod";


// utility methods for finding a user
// creating a user
// deleting a user
// editing and updating a user profile

export const findUser = async (email: string) => {
    return await prisma.user.findFirst({
        where: { email },
        include: {
            role: {
                include: {
                    permissions: {include: {permission: true}}
                }
            }
        }
    })
};

export const createUser = async (data: User) => {
    return await prisma.user.create({
        data: {
            ...data,
            role: {connect: {name: "user"}},            
        },
        include: {
            role: {
                include: {
                    permissions: {include: {permission: true}}
                }
            }
        }
    })
};


export const verification = async (userId: string, token: string, expiry: Date) => {
    return await prisma.verificationToken.create({
        data: {
            userId,
            token,
            expiresAt: expiry 
        }
    })
}


export const findUserById = async (id: string) => {
    return await prisma.user.findFirst({
        where: {id},
        include: {
            role: {
                include: {
                    permissions: {include: {permission: true}}
                }
            }
        }
    })
};


export const updateUserPassword = async (hashedPassword: string, email: string) => {
    return await prisma.user.update({
        where: {email},
        data: {password: hashedPassword},
        include: {
            role: {
                include: {permissions: true}
            }
        }
    })
};
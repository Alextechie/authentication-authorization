import { connect } from "bun";
import prisma from "../../utils/prisma";
import type { User } from "../../utils/types";


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
            role: {connect: {name: "user"}}
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
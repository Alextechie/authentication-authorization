import prisma from "../utils/prisma";

console.log("Request reached here");

async function main() {
    const admin = await prisma.role.upsert({
        where: { name: "admin" },
        update: {},
        create: { name: "admin" }
    });


    const user = await prisma.role.upsert({
        where: { name: "user" },
        update: {},
        create: { name: "user" }
    });


    const manager = await prisma.role.upsert({
        where: { name: "manager" },
        update: {},
        create: { name: "manager" }
    })


    const permisisons = [
        "user:read",
        "user:create",
        "user:update",
        "user:delete",
        "service:create",
        "service:read",
        "service:update",
        "service:delete",
        "service:assign",
        "service:manage"
    ];


    // mapping over all the permissions and seeding them into the database
    for (const action of permisisons) {
        await prisma.permission.upsert({
            where: { action },
            update: {},
            create: { action }
        })
    };

    // fetch all user permissions
    const allPermissions = await prisma.permission.findMany();


    // ceate role permissions: Admin permissions
    await prisma.rolePermission.createMany({
        data: allPermissions.map((p) => ({
            roleId: admin.id,
            permissionId: p.id
        })),
        skipDuplicates: true
    });


    // user only gets limited permissions
    const userPermissions = allPermissions.filter((p) =>
        ["user:read", "user:update", "user:delete"].includes(p.action)
    );

    // mass create user role permissions
    await prisma.rolePermission.createMany({
        data: userPermissions.map((p) => ({
            roleId: user.id,
            permissionId: p.id
        })),
        skipDuplicates: true
    });

    // manager only gets limited resources/permissions
    const managerPermissions = allPermissions.filter((p) =>
        ["service:read", "service:manage", "user:read"].includes(p.action)
    );

    // mass create the manager role permissions
    await prisma.rolePermission.createMany({
        data: managerPermissions.map((p) => ({
            roleId: manager.id,
            permissionId: p.id
        })),
        skipDuplicates: true
    });
};

main()
    .then(() => console.log("Seeding done"))
    .catch(console.error)
    .finally(() => prisma.$disconnect())
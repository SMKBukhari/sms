import { Role } from "../src/generated/prisma/enums";

console.log("Imported Role Object:", Role);
console.log("Role.ADMIN value:", Role.ADMIN, typeof Role.ADMIN);

const sessionRole = "ADMIN";
const allowedRoles = [Role.ADMIN, Role.TEACHER];

console.log("Allowed Roles:", allowedRoles);
console.log("Includes Check:", allowedRoles.includes(sessionRole as any));
console.log("Strict Eq Check:", sessionRole === Role.ADMIN);

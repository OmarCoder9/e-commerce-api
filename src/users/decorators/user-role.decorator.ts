import { SetMetadata } from "@nestjs/common";
import { UserRoles } from "../../utils/userRoles";

export const Roles = (...roles:UserRoles[])=>SetMetadata('roles', roles)
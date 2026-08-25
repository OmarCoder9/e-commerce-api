import { UserRoles } from "./userRoles"

export type JwtPayloadType = {
    id: number
    role: UserRoles
} 
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_KEY } from "./role.decorator.js";

interface RequestWithUser extends Request {
    user?: any;
}

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest<RequestWithUser>();

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }
        return requiredRoles.some((role) => user.role === role);
    }
}

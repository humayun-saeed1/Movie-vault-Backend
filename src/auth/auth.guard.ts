import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service.js";

interface RequestWithUser extends Request {
    user?: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private authService: AuthService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        return this.validateRequest(request);
    }

    private async validateRequest(request: RequestWithUser): Promise<boolean> {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return false;
        }

        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = this.jwtService.verify(token);
                request.user = decoded;
                return true;
            } catch (error) {
                return false;
            }
        }

        return false;
    }
}
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

        if (authHeader.startsWith('Basic ')) {
            const credentials = authHeader.split(' ')[1];
            try {
                const decodedCredentials = Buffer.from(credentials, 'base64').toString('ascii');
                const [identity, ...passwordParts] = decodedCredentials.split(':');
                const password = passwordParts.join(':');
                if (!identity || !password) {
                    return false;
                }
                const result = await this.authService.login({ identity, password });
                if (result && result.user) {
                    request.user = result.user;
                    return true;
                }
            } catch (error) {
                return false;
            }
        }

        return false;
    }
}
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";

interface RequestWithUser extends Request {
    user?: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        return this.validateRequest(request);
    }
    private validateRequest(request: RequestWithUser) {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return false;
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = this.jwtService.verify(token);
            request.user = decoded;
            return true;
        } catch (error) {
            return false;
        }
    }
}
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';
import { Role } from '#generated/prisma/index.js';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    const existingemail = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingemail) {
      throw new ConflictException("User with this email already exists.");
    }
    const existingUsername = await this.prisma.user.findUnique({
      where: { username }
    });
    if (existingUsername) {
      throw new ConflictException("User with this username already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: Role.VIEWER
      }
    });
    const { password: _, ...userWithoutPassword } = user;
    return { message: "User registered successfully", user: userWithoutPassword };
  }
  async login(loginDto: LoginDto) {
    const { identity, password } = loginDto;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identity },
          { username: identity },
        ]
      }
    });

    if (!user) {
      throw new UnauthorizedException("Invalid Credentials.");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException("Invalid Credentials.");
    }
    const payload = { sub: user.id, username: user.username, role: user.role };
    return {
      token: await this.jwtService.signAsync(payload),
      message: "Login Successfull",
      user: { id: user.id, username: user.username, role: user.role }
    }



  }


}

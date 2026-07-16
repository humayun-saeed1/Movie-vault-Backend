import { Controller, Post, Body, Patch, Param, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from './auth.guard.js';
import { RoleGuard } from './role.guard.js';
import { Roles } from './role.decorator.js';
import { ApiBearerAuth, ApiBasicAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('signin')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin')
  @Get('get-all')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin')
  @Patch('approve-user/:id')
  approveUser(@Param('id') id: string) {
    return this.authService.approveUser(id);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin')
  @Patch('reject-user/:id')
  rejectUser(@Param('id') id: string) {
    return this.authService.rejectUser(id);
  }

  @ApiBearerAuth()
  @ApiBasicAuth()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('Admin')
  @Get('get-user-me/:id')
  getUserMe(@Param('id') id: string) {
    return this.authService.getUserMe(id);
  }
}

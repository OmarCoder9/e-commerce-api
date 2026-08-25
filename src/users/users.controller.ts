import { UsersService } from './users.service';
import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './guards/auth.guard';

import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayloadType } from '../utils/types';
import { Roles } from './decorators/user-role.decorator';
import { UserRoles } from '../utils/userRoles';
import { AuthRolesGuard } from './guards/auth-roles.guard';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('auth/register')
  public register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }
  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  public login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  @Get('current-user')
  @UseGuards(AuthGuard)
  public getCurrentUser(@CurrentUser() payload: JwtPayloadType) {
    console.log('In Handler');
    return this.usersService.getCurrentUser(payload.id);
  }

  @Get()
  @Roles(UserRoles.ADMIN)
  @UseGuards(AuthRolesGuard)
  public getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Patch()
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthRolesGuard)
  public updateUser(
    @CurrentUser() payload: JwtPayloadType,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.updateUser(payload.id, body);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN, UserRoles.USER)
  @UseGuards(AuthRolesGuard)
  public deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    return this.usersService.deleteUser(id, payload);
  }
}

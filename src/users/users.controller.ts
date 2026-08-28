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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express, Response } from 'express';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

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

  @Post('upload-image')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('user-image'))
  public uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() payload: JwtPayloadType,
  ) {
    if (!file) throw new BadRequestException('no image provided');
    return this.usersService.setProfileImage(payload.id, file.filename);
  }

  @Delete('images/remove-profile-image')
  @UseGuards(AuthGuard)
  public deleteProfileImage(@CurrentUser() payload: JwtPayloadType) {
    return this.usersService.removeProfileImage(payload.id);
  }

  @Get('images/:image')
  @UseGuards(AuthGuard)
  public getProfileImage(@Param('image') image: string, @Res() res: Response) {
    return res.sendFile(image, { root: 'images/users' });
  }

  @Get('verify-email/:userId/:verificationToken')
  public verifyEmail(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('verificationToken') verificationToken: string,
  ) {
    return this.usersService.verifyEmail(userId, verificationToken);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  public forgetPassword(@Body() body: ForgotPasswordDto) {
    return this.usersService.sendResetPassword(body.email);
  }

  @Get('reset-password/:id/:resetPasswordToken')
  public getResetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Param('resetPasswordToken') resetPasswordToken: string,
  ) {
     return this.usersService.getResetPassword(id, resetPasswordToken)
  }

  @Post("reset-password")
  public resetPassword(@Body() body: ResetPasswordDto){
    return this.usersService.resetPassword(body)
  }
}

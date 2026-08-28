import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsStrongPassword,
  IsNumber,
  Min,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  @ApiProperty()
  newPassword!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @ApiProperty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @ApiProperty()
  resetPasswordToken!:string;
}

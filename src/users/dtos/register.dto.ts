import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsEmail,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  @ApiProperty()
  username!: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(250)
  @ApiProperty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  @IsStrongPassword()
  @ApiProperty()
  password!: string;
}

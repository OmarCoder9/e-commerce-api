import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(250)
  @ApiProperty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  @ApiProperty()
  password!: string;
}

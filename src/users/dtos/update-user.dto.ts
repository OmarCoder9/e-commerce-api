import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsStrongPassword,
  IsOptional,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 150)
  @IsOptional()
  @ApiPropertyOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  @IsStrongPassword()
  @IsOptional()
  @ApiPropertyOptional()
  password?: string;
}

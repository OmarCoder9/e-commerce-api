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
  username?: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  @IsStrongPassword()
  @IsOptional()
  password?: string;
}

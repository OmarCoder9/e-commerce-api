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
  newPassword!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  userId!: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  resetPasswordToken!:string;
}

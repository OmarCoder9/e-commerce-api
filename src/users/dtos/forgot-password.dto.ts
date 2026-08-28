import {
  IsNotEmpty,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(250)
  email!: string;
}

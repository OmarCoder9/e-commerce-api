import { ConfigService } from '@nestjs/config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto } from './dtos/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from '../utils/types';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'node:crypto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Create new user
   * @param registerDto data for creating a new user
   * @returns a new user with JWT
   */
  public async register(registerDto: RegisterDto) {
    const { email, password, username } = registerDto;
    const oldUser = await this.userRepository.findOne({ where: { email } });

    if (oldUser) throw new BadRequestException('User already exist');

    const hashedPassword = await this.hashPassword(password);

    let newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      username,
      verificationToken: randomBytes(32).toString('hex'),
    });

    newUser = await this.userRepository.save(newUser);
    const link = this.generateLink(newUser.id, newUser.verificationToken);

    await this.mailService.sendVerifyEmailTemplate(email, link);

    return {
      message:
        'Verification token has been sent to your email, please verify your account',
    };
  }

  /**
   * Login user
   * @param loginDto login data "email" and "password"
   * @returns JWT token
   */
  public async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Invalid email or password');

    const isMatchedPassword = await bcrypt.compare(password, user.password);
    if (!isMatchedPassword)
      throw new BadRequestException('Invalid email or password');

    if (!user.isAccountVerified) {
      let verificationToken = user.verificationToken;

      if (!verificationToken) {
        user.verificationToken = randomBytes(32).toString('hex');
        const res = await this.userRepository.save(user);
        verificationToken = res.verificationToken;
      }

      const link = this.generateLink(user.id, verificationToken);
      await this.mailService.sendVerifyEmailTemplate(email, link);

      return {
        message:
          'Verification token has been sent to your email, please verify your account adn try to login again',
      };
    }

    const accessToken = await this.generateJWT({
      id: user.id,
      role: user.role,
    });

    await this.mailService.sendLoginEmail(user.email);

    return { accessToken };
  }

  public async sendResetPasswordLink(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user)
      throw new BadRequestException("user with this email doesn't exist");

    user.resetPasswordToken = randomBytes(32).toString('hex');

    const res = await this.userRepository.save(user);
    const resetPasswordLink = `${this.config.get<string>('FRONTEND_DOMAIN')}/reset-password/${user.id}/${res.resetPasswordToken}`;
    await this.mailService.sendResetPasswordTemplate(email, resetPasswordLink);
    return { message: 'Password reset link sent to your email' };
  }

  public async getRsestPasswordLink(
    userId: number,
    resetPasswordToken: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Invalid Link');

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken === '' ||
      user.resetPasswordToken !== resetPasswordToken
    )
      throw new BadRequestException('Invalid link');

    return {message:"Valid Link"}
  }

  public async resetPassword(dto:ResetPasswordDto){
    const {userId, resetPasswordToken, newPassword} = dto
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Invalid Link');

    if (
      user.resetPasswordToken === null ||
      user.resetPasswordToken === '' ||
      user.resetPasswordToken !== resetPasswordToken
    )
      throw new BadRequestException('Invalid link');

    const hashedPassword = await this.hashPassword(newPassword)
    user.password = hashedPassword
    user.resetPasswordToken = ""

    await this.userRepository.save(user)

    return {message: "Password reset successfully, please log in"}
  }

  /**
   * Hashing Password
   * @param password plain text password
   * @returns hashed password
   */
  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Generate json web token
   * @param payload JWT Payload
   * @returns access token
   */
  private async generateJWT(payload: JwtPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private generateLink(userId: number, verificationToken: string) {
    return `${this.config.get<string>('BACKEND_DOMAIN')}/api/users/verify-email/${userId}/${verificationToken}`;
  }
}

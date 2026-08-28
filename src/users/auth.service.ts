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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
    });

    newUser = await this.userRepository.save(newUser);

    const accessToken = await this.generateJWT({
      id: newUser.id,
      role: newUser.role,
    });
    return { accessToken };
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

    const accessToken = await this.generateJWT({
      id: user.id,
      role: user.role,
    });

    await this.mailService.sendLoginEmail(user.email)

    return { accessToken };
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
}

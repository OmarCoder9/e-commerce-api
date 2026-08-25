import { LoginDto } from './dtos/login.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadType } from '../utils/types';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRoles } from '../utils/userRoles';

@Injectable()
export class UsersService {
  // private users: IUser[] = [
  //   { id: 1, username: 'Omar', email: 'omar.ahmed@gmail.com', password: 'Om@12345' },
  //   { id: 2, username: 'Ahmed', email: '3bkreno.dev@gmail.com', password: '3Bkren@123' },
  // ];

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

    const hashedPassword = await this.hashPassword(password)

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
    return { status: 'success', data: { accessToken } };
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
    return { status: 'succcess', data: { accessToken } };
  }

  public async getCurrentUser(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  public getAllUsers() {
    return this.userRepository.find();
  }

  public async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { username, password } = updateUserDto;
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException();

    user.username = username ?? user.username;
    if (password)
      user.password = await this.hashPassword(password)

    return this.userRepository.save(user)
  }

  public async deleteUser(id:number, payload: JwtPayloadType){
    const user = await this.getCurrentUser(id)
    if(user.id === payload.id || payload.role === UserRoles.ADMIN){
      await this.userRepository.remove(user)
      return {message:"User has been deleted"}
    }
    throw new ForbiddenException("Access denied, You're not allowed")
  }


  /**
   * Generate json web token
   * @param payload JWT Payload
   * @returns access token
   */
  private async generateJWT(payload: JwtPayloadType): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private async hashPassword(password:string): Promise<string>{
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  }
}

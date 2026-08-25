import { LoginDto } from './dtos/login.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayloadType } from '../utils/types';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRoles } from '../utils/userRoles';
import { AuthService } from './auth.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {}
  /**
   * Create new user
   * @param registerDto data for creating a new user
   * @returns a new user with JWT
   */
  public async register(registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Login user
   * @param loginDto login data "email" and "password"
   * @returns JWT token
   */
  public async login(loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
    if (password) user.password = await this.authService.hashPassword(password);

    return this.userRepository.save(user);
  }

  public async deleteUser(id: number, payload: JwtPayloadType) {
    const user = await this.getCurrentUser(id);
    if (user.id === payload.id || payload.role === UserRoles.ADMIN) {
      await this.userRepository.remove(user);
      return { message: 'User has been deleted' };
    }
    throw new ForbiddenException("Access denied, You're not allowed");
  }
}

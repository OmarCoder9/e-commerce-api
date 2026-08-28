import { BadRequestException, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MailModule } from '../mail/mail.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  imports: [
    MailModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>('JWT_SECRET_KEY'),
          signOptions: { expiresIn: config.get<number>('JWT_EXPIRES_IN') },
        };
      },
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './images/users',
        filename: (_req, file, cb) => {
          const prefix = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
          const filename = `${prefix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image')) cb(null, true);
        else cb(new BadRequestException('Unsupported file format'), false);
      },
      limits: { fileSize: 1024 * 1024 * 2 },
    }),
  ],
  exports: [UsersService],
})
export class UsersModule {}

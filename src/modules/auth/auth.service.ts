import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';

import { UserService } from '../users/user.service';
import { RoleService } from '../roles/role.service';
import { RegisterDto } from './dto/register.dto';
import { LoginResponseEntity } from './entities/auth.entity';
import { UserDocument } from '../users/schema/user.schema';

@Injectable()
export class AuthService {
  private readonly refreshTokenOptions: JwtSignOptions;

  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.refreshTokenOptions = {
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
    };
  }

  comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<UserDocument | null> {
    const user = await this.userService.findByEmail(email);
    if (user && (await this.comparePasswords(pass, user.password))) {
      return user;
    }
    return null;
  }

  async signIn(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      roles: user.roles.map((r) => r.name),
    };

    const accessToken = await this.jwtService.signAsync({
      ...payload,
      type: 'access',
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        ...payload,
        type: 'refresh',
      },
      this.refreshTokenOptions,
    );

    return plainToInstance(
      LoginResponseEntity,
      {
        accessToken,
        refreshToken,
      },
      { excludeExtraneousValues: true },
    );
  }

  async signUp(registerDto: RegisterDto) {
    const { email, password, phoneNumber } = registerDto;

    const userName = email.split('@')[0];

    const roleDoc = await this.roleService.findByNameAsDocument('user');

    if (!roleDoc) {
      throw new UnauthorizedException('Role not found');
    }

    const [emailExists, usernameExists, phoneExists] = await Promise.all([
      this.userService.existsByEmail(email),
      this.userService.existsByUsername(userName),
      this.userService.existsByPhoneNumber(phoneNumber),
    ]);

    if (emailExists) {
      throw new ConflictException('Email already in use');
    }

    if (usernameExists) {
      throw new ConflictException('Username already in use');
    }

    if (phoneExists) {
      throw new ConflictException('Phone number already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userService.create({
      username: userName,
      roles: [{ _id: roleDoc._id, name: roleDoc.name }],
      email,
      password: hashedPassword,
      phoneNumber,
    });

    return newUser;
  }

  async refreshToken(token: string) {
    const payload = await this.jwtService.verifyAsync<{
      sub: string;
      email: string;
      type: string;
    }>(token, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
    });

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const userDoc = await this.userService.findByEmail(payload.email);

    if (!userDoc) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = userDoc.toObject() as Record<string, any>;
    delete user.password;

    const newPayload = {
      sub: userDoc._id.toString(),
      email: userDoc.email,
      roles: userDoc.roles.map((r) => r.name),
    };

    const accessToken = await this.jwtService.signAsync({
      ...newPayload,
      type: 'access',
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        ...newPayload,
        type: 'refresh',
      },
      this.refreshTokenOptions,
    );

    return plainToInstance(
      LoginResponseEntity,
      { accessToken, refreshToken },
      { excludeExtraneousValues: true },
    );
  }
}

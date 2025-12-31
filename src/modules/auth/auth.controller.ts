import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';

import { ResponseMessage } from '../../common/http/decorators';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh.token.dto';
import { LocalAuthGuard } from './guards/local.auth.guard';
import { UserDocument } from '../users/schema/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // login
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ResponseMessage('Login successfully')
  login(@Request() req: { user: any }) {
    return this.authService.signIn(req.user as UserDocument);
  }

  // register
  @Post('register')
  @ResponseMessage('Registration successful')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.signUp(registerDto);
  }

  // refresh token
  @Post('refresh-token')
  @ResponseMessage('Token refreshed successfully')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}

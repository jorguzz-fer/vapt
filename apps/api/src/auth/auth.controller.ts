import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterProfissionalDto } from './dto/register-profissional.dto';
import { RegisterEstabelecimentoDto } from './dto/register-estabelecimento.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register/profissional')
  registerProfissional(@Body() dto: RegisterProfissionalDto) {
    return this.authService.registerProfissional(dto);
  }

  @Public()
  @Post('register/estabelecimento')
  registerEstabelecimento(@Body() dto: RegisterEstabelecimentoDto) {
    return this.authService.registerEstabelecimento(dto);
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }
}

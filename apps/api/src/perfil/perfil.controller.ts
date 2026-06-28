import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '@vapt/shared';
import { UpdatePerfilProfissionalDto } from './dto/update-perfil-profissional.dto';
import { UpdatePerfilEstabelecimentoDto } from './dto/update-perfil-estabelecimento.dto';

@Controller('perfil')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Get()
  @Roles(UserRole.PROFISSIONAL, UserRole.ESTABELECIMENTO, UserRole.ADMIN)
  getPerfil(@CurrentUser() user: JwtPayload) {
    return this.perfilService.getPerfil(user.sub, user.role as UserRole);
  }

  @Patch('profissional')
  @Roles(UserRole.PROFISSIONAL)
  updateProfissional(
    @Body() dto: UpdatePerfilProfissionalDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.perfilService.updatePerfilProfissional(user.sub, dto);
  }

  @Patch('estabelecimento')
  @Roles(UserRole.ESTABELECIMENTO)
  updateEstabelecimento(
    @Body() dto: UpdatePerfilEstabelecimentoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.perfilService.updatePerfilEstabelecimento(user.sub, dto);
  }
}

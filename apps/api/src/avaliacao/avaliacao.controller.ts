import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AvaliacaoService } from './avaliacao.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '@vapt/shared';

@Controller('avaliacoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  @Post()
  @Roles(UserRole.ESTABELECIMENTO, UserRole.PROFISSIONAL)
  create(@Body() dto: CreateAvaliacaoDto, @CurrentUser() user: JwtPayload) {
    return this.avaliacaoService.create(dto, user.sub);
  }

  @Get('plantao/:plantaoId/minha')
  @Roles(UserRole.ESTABELECIMENTO, UserRole.PROFISSIONAL)
  checkJaAvaliou(
    @Param('plantaoId') plantaoId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.avaliacaoService.checkJaAvaliou(plantaoId, user.sub);
  }
}

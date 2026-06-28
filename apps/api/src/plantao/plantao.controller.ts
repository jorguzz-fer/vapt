import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PlantaoService } from './plantao.service';
import { CreatePlantaoDto } from './dto/create-plantao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '@vapt/shared';

@Controller('plantoes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlantaoController {
  constructor(private readonly plantaoService: PlantaoService) {}

  @Post()
  @Roles(UserRole.ESTABELECIMENTO)
  create(@Body() dto: CreatePlantaoDto, @CurrentUser() user: JwtPayload) {
    return this.plantaoService.create(dto, user.sub);
  }

  @Get('meus')
  @Roles(UserRole.ESTABELECIMENTO)
  findMeus(@CurrentUser() user: JwtPayload) {
    return this.plantaoService.findByEstabelecimento(user.sub);
  }

  @Get()
  @Roles(UserRole.PROFISSIONAL, UserRole.ADMIN)
  findAbertos() {
    return this.plantaoService.findAbertos();
  }

  @Get(':id')
  @Roles(UserRole.ESTABELECIMENTO)
  findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.plantaoService.findByIdParaEstabelecimento(id, user.sub);
  }

  @Get(':id/candidaturas')
  @Roles(UserRole.ESTABELECIMENTO)
  findCandidaturas(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.plantaoService.findCandidaturasDoPlantao(id, user.sub);
  }

  @Patch(':id/concluir')
  @Roles(UserRole.ESTABELECIMENTO)
  concluir(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.plantaoService.concluir(id, user.sub);
  }
}

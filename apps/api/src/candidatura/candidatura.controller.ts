import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CandidaturaService } from './candidatura.service';
import { CreateCandidaturaDto } from './dto/create-candidatura.dto';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '@vapt/shared';

@Controller('candidaturas')
export class CandidaturaController {
  constructor(private readonly candidaturaService: CandidaturaService) {}

  @Post()
  @Roles(UserRole.PROFISSIONAL)
  create(@Body() dto: CreateCandidaturaDto, @CurrentUser() user: JwtPayload) {
    return this.candidaturaService.create(dto, user.sub);
  }

  @Get('minhas')
  @Roles(UserRole.PROFISSIONAL)
  findMinhas(@CurrentUser() user: JwtPayload) {
    return this.candidaturaService.findByProfissional(user.sub);
  }

  @Patch(':id/aceitar')
  @Roles(UserRole.ESTABELECIMENTO)
  aceitar(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.candidaturaService.aceitar(id, user.sub);
  }

  @Patch(':id/rejeitar')
  @Roles(UserRole.ESTABELECIMENTO)
  rejeitar(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.candidaturaService.rejeitar(id, user.sub);
  }
}

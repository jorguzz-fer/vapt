import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CandidaturaService } from './candidatura.service';
import { CreateCandidaturaDto } from './dto/create-candidatura.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '@vapt/shared';

@Controller('candidaturas')
@UseGuards(JwtAuthGuard, RolesGuard)
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
}

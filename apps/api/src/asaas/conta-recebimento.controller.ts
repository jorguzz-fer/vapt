import { Body, Controller, Get, Post } from '@nestjs/common';
import { AsaasService } from './asaas.service';
import { CriarContaRecebimentoDto } from './dto/criar-conta-recebimento.dto';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../common/decorators/current-user.decorator';
import { UserRole } from '@vapt/shared';

@Controller('conta-recebimento')
@Roles(UserRole.PROFISSIONAL)
export class ContaRecebimentoController {
  constructor(private readonly asaasService: AsaasService) {}

  @Get()
  status(@CurrentUser() user: JwtPayload) {
    return this.asaasService.obterStatus(user.sub);
  }

  @Post()
  criar(
    @Body() dto: CriarContaRecebimentoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.asaasService.criarContaRecebimento(user.sub, dto);
  }
}

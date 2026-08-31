import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@vapt/shared';

@Controller('configuracoes')
@Roles(UserRole.ADMIN)
export class ConfiguracaoController {
  constructor(private readonly configuracaoService: ConfiguracaoService) {}

  @Get()
  get() {
    return this.configuracaoService.get();
  }

  @Patch()
  update(@Body() dto: UpdateConfiguracaoDto) {
    return this.configuracaoService.update(dto);
  }
}

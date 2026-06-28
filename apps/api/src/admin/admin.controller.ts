import { Controller, Get, Param, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@vapt/shared';

@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('profissionais')
  listProfissionais() {
    return this.adminService.listProfissionais();
  }

  @Get('estabelecimentos')
  listEstabelecimentos() {
    return this.adminService.listEstabelecimentos();
  }

  @Patch('profissionais/:id/verificar')
  verificar(@Param('id') id: string) {
    return this.adminService.verificarProfissional(id);
  }
}

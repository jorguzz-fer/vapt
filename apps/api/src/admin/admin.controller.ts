import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@vapt/shared';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
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

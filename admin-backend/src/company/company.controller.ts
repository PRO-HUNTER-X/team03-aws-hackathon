import { Controller, Get, Param } from '@nestjs/common';
import { CompanyService } from './company.service';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async getAllCompanies() {
    return await this.companyService.getAllCompanies();
  }

  @Get('stats')
  async getCompanyStats() {
    return await this.companyService.getCompanyStats();
  }

  @Get('industry/:industry')
  async getCompaniesByIndustry(@Param('industry') industry: string) {
    return await this.companyService.getCompaniesByIndustry(industry);
  }

  @Get(':id')
  async getCompanyById(@Param('id') id: string) {
    return await this.companyService.getCompanyById(id);
  }
}
import { Injectable } from '@nestjs/common';
import { DynamoDBService } from '../common/dynamodb.service';

export interface Company {
  companyId: string;
  companyName: string;
  industry: string;
  businessType: string;
  companySize: string;
  monthlyRevenue: number;
  customerCount: number;
  csTeamSize: number;
  createdAt: string;
}

@Injectable()
export class CompanyService {
  private readonly companyTable = process.env.COMPANY_TABLE || 'companies';

  constructor(private readonly dynamoDBService: DynamoDBService) {
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const existingData = await this.dynamoDBService.scan(this.companyTable);
    if (existingData.length === 0) {
      const sampleCompanies: Company[] = [
        {
          companyId: "hunters-company",
          companyName: "헌터스 쇼핑몰", 
          industry: "이커머스",
          businessType: "B2C",
          companySize: "중소기업",
          monthlyRevenue: 50000000,
          customerCount: 1500,
          csTeamSize: 2,
          createdAt: "2024-01-15T00:00:00Z"
        },
        {
          companyId: "tech-saas",
          companyName: "테크 SaaS",
          industry: "SaaS",
          businessType: "B2B",
          companySize: "스타트업",
          monthlyRevenue: 30000000,
          customerCount: 500,
          csTeamSize: 1,
          createdAt: "2024-02-01T00:00:00Z"
        },
        {
          companyId: "finance-corp",
          companyName: "파이낸스 코퍼레이션",
          industry: "금융",
          businessType: "B2C",
          companySize: "대기업",
          monthlyRevenue: 200000000,
          customerCount: 10000,
          csTeamSize: 10,
          createdAt: "2024-01-01T00:00:00Z"
        }
      ];

      for (const company of sampleCompanies) {
        await this.dynamoDBService.put(this.companyTable, company);
      }
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    const items = await this.dynamoDBService.scan(this.companyTable);
    return items as Company[];
  }

  async getCompanyById(companyId: string): Promise<Company | null> {
    const result = await this.dynamoDBService.get(this.companyTable, { companyId });
    return (result as Company) || null;
  }

  async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    const items = await this.dynamoDBService.query(
      this.companyTable,
      'industry = :industry',
      { ':industry': industry },
      'industry-index'
    );
    return items as Company[];
  }

  async getCompanyStats() {
    const companies = await this.getAllCompanies();
    
    const industryStats = companies.reduce((acc, company) => {
      acc[company.industry] = (acc[company.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sizeStats = companies.reduce((acc, company) => {
      acc[company.companySize] = (acc[company.companySize] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgRevenue = companies.reduce((sum, company) => sum + company.monthlyRevenue, 0) / companies.length;
    const avgCustomers = companies.reduce((sum, company) => sum + company.customerCount, 0) / companies.length;

    return {
      total: companies.length,
      industries: industryStats,
      sizes: sizeStats,
      averages: {
        monthlyRevenue: Math.round(avgRevenue),
        customerCount: Math.round(avgCustomers)
      }
    };
  }
}
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('test_auth_라우팅_경로_검증', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    testDynamoDB: jest.fn(),
    getInitialRoute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('test_컨트롤러_경로가_admin_auth로_설정됨', () => {
    const controllerMetadata = Reflect.getMetadata('path', AuthController);
    expect(controllerMetadata).toBe('admin/auth');
  });

  it('test_login_엔드포인트_존재', () => {
    expect(controller.login).toBeDefined();
  });

  it('test_verify_엔드포인트_존재', () => {
    expect(controller.verifyToken).toBeDefined();
  });

  it('test_initial_route_엔드포인트_존재', () => {
    expect(controller.getInitialRoute).toBeDefined();
  });
});

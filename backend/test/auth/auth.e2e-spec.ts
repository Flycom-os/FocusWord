import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Auth (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Создание пользователя вручную перед тестами

  });

  // afterAll(async () => {
  //   await prisma.user.deleteMany();
  //   await app.close();
  // });

  it('✅ Должен зарегистрировать нового пользователя', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'newuuser@example.com',
        password: 'mypassword',
        name: 'NewUser',
      })
      .expect(201);

    expect(response.body).toHaveProperty('message');
    expect(response.body.user).toHaveProperty('id');
  });

  it('✅ Должен авторизовать пользователя', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: 'newuuser@example.com', // Исправлено: email -> identifier
        password: 'mypassword',
      });

    console.log(response.body);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refreash_token');
  });
});

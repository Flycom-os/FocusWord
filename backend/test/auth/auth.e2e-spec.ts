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

    // Manually create user before tests
  });

  // afterAll(async () => {
  //   await prisma.user.deleteMany();
  //   await app.close();
  // });

  it('✅ Should register a new user', async () => {
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

  it('✅ Should authenticate a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        identifier: 'newuuser@example.com', // Corrected: email -> identifier
        password: 'mypassword',
      });

    console.log(response.body);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body).toHaveProperty('refreash_token');
  });
});

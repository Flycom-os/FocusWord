import { Module } from '@nestjs/common';
import { Pool } from 'pg';

@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: () => {
        return new Pool({
          user: 'postgres',
          host: 'localhost',
          database: 'pushka',
          password: 'nikita12345',
          port: 5432,
        });
      },
    },
  ],
  exports: ['PG_POOL'], // 👈 Export PG_POOL to use in other modules
})
export class DatabaseModule {}

import { Global, Module } from '@nestjs/common';
import { createDb } from '@vapt/db';

export const DB = Symbol('DRIZZLE_DB');

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL is not set');
        return createDb(url);
      },
    },
  ],
  exports: [DB],
})
export class DatabaseModule {}

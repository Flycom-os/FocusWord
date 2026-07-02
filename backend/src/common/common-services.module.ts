import { Module, Global } from '@nestjs/common';
import { CryptoService } from './services/crypto.service';

@Global() // Make this module global to avoid importing it everywhere
@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CommonServicesModule {}

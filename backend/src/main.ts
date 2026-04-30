import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('[DIAG] MONGODB_URI =', process.env.MONGODB_URI ? 'SET' : 'UNDEFINED');
  console.log('[DIAG] PORT =', process.env.PORT ?? '3000 (default)');
  console.log('[DIAG] All env keys:', Object.keys(process.env).filter(k => !k.toLowerCase().includes('secret') && !k.toLowerCase().includes('key') && !k.toLowerCase().includes('password')).join(', '));

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use((req, res, next) => {
    console.log(`[GLOBAL LOG] ${req.method} ${req.url}`);
    next();
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

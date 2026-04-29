// cloudinary.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CLOUDINARY = 'CLOUDINARY';

@Global()
@Module({
  providers: [
    {
      provide: CLOUDINARY,
      useFactory: (config: ConfigService) => {
        cloudinary.config({
          cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
          api_key:    config.get('CLOUDINARY_API_KEY'),
          api_secret: config.get('CLOUDINARY_API_SECRET'),
        });
        return cloudinary;
      },
      inject: [ConfigService],
    },
  ],
  exports: [CLOUDINARY],
})
export class CloudinaryModule {}

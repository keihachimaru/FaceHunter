import { Injectable, Inject } from '@nestjs/common';
import { CLOUDINARY } from '../cloudinary/cloudinary.module';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  constructor(
    @Inject(CLOUDINARY) private cloudinary: typeof cloudinaryV2,
  ) {}

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (file.path) {
        const result = await this.cloudinary.uploader.upload(file.path, {
          folder,
          resource_type: 'image',
        });
        return result.secure_url;
    }
    
    return new Promise((resolve, reject) => {
        const stream = this.cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if(error) return reject(error);
                if (!result) return reject(new Error("Cloudinary returned no result"));
                resolve(result.secure_url);
            }
        );

        const readable = new Readable();
        readable._read = () => {};
        readable.push(file.buffer);
        readable.push(null);
        readable.pipe(stream);
    })
  }
}

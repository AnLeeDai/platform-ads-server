import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('r2.accessKeyId');
    const secretAccessKey =
      this.configService.get<string>('r2.secretAccessKey');
    const endpoint = this.configService.get<string>('r2.endpoint');
    const bucket = this.configService.get<string>('r2.bucket');
    const publicUrl = this.configService.get<string>('r2.publicUrl');

    if (
      !accessKeyId ||
      !secretAccessKey ||
      !endpoint ||
      !bucket ||
      !publicUrl
    ) {
      throw new Error('Missing R2 configuration');
    }

    this.bucket = bucket;
    this.publicUrl = publicUrl;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string,
    isPublic = true,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: contentType,
        ACL: isPublic ? 'public-read' : 'private',
      });

      await this.s3Client.send(command);

      return isPublic
        ? `${this.publicUrl.endsWith('/') ? this.publicUrl : `${this.publicUrl}/`}${key}`
        : key;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error uploading file to R2: ${errorMessage}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error deleting file from R2: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Extracts the key from a public R2 URL.
   * @param url The public URL (e.g., "https://pub-xxx.r2.dev/ads/images/xxx.png")
   * @returns The key (e.g., "ads/images/xxx.png")
   */
  extractKeyFromUrl(url: string): string {
    if (!url.startsWith(this.publicUrl)) {
      return url;
    }
    return url.replace(
      this.publicUrl.endsWith('/') ? this.publicUrl : `${this.publicUrl}/`,
      '',
    );
  }
}

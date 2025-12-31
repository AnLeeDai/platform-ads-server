import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/modules/storage/storage.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { ResponseMessage } from 'src/common/http';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('File uploaded successfully')
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = `${Date.now()}-${file.originalname}`;
    const url = await this.storageService.uploadFile(
      file.buffer,
      key,
      file.mimetype,
    );
    return { url };
  }
}

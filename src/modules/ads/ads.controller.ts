import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt.auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { CreateAdsDto } from './dto/create.ads.dto';
import { UpdateAdsDto } from './dto/update.ads.dto';
import { AdsService } from './ads.service';
import { ResponseMessage, Roles } from 'src/common/http';
import { PaginationQueryDto } from 'src/common/dto/pagination.dto';

@Controller('ads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('')
  @ResponseMessage('Ads retrieved successfully')
  getAllAds(@Query() paginationQuery: PaginationQueryDto) {
    return this.adsService.findAll(paginationQuery);
  }

  @Post('create')
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageUrl', maxCount: 1 },
      { name: 'videoUrl', maxCount: 1 },
    ]),
  )
  @ResponseMessage('Ad created successfully')
  createAd(
    @Body() createAdDto: CreateAdsDto,
    @UploadedFiles()
    files: {
      imageUrl?: Express.Multer.File[];
      videoUrl?: Express.Multer.File[];
    },
  ) {
    return this.adsService.createAd(createAdDto, files);
  }

  @Delete(':id/delete')
  @Roles('admin')
  @ResponseMessage('Ad deleted successfully')
  deleteAd(@Param('id') id: string) {
    return this.adsService.deleteAd(id);
  }

  @Put(':id/update')
  @Roles('admin')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imageUrl', maxCount: 1 },
      { name: 'videoUrl', maxCount: 1 },
    ]),
  )
  @ResponseMessage('Ad updated successfully')
  updateAd(
    @Param('id') id: string,
    @Body() updateAdDto: UpdateAdsDto,
    @UploadedFiles()
    files: {
      imageUrl?: Express.Multer.File[];
      videoUrl?: Express.Multer.File[];
    },
  ) {
    return this.adsService.updateAd(id, updateAdDto, files);
  }

  @Get('/:id/detail')
  @ResponseMessage('Ad detail retrieved successfully')
  getAdDetails(@Param('id') id: string) {
    return this.adsService.findById(id);
  }
}

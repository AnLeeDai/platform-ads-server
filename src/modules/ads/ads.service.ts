import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';

import { AdsDocument } from './schemas/ads.schema';
import { CreateAdsDto } from './dto/create.ads.dto';
import { UpdateAdsDto } from './dto/update.ads.dto';
import { StorageService } from 'src/modules/storage/storage.service';
import { PaginationOptions } from 'src/common/http';
import { PaginatedResponseEntity } from 'src/common/entities';
import { AdsEntity } from './entities/ads.entities';
import { paginateQuery } from 'src/common/utils/pagination.util';
import { plainToInstance } from 'class-transformer';
import { generateCleanFilename } from 'src/common/utils/string.util';

@Injectable()
export class AdsService {
  constructor(
    @Inject('ADS_MODEL')
    private readonly adsModel: Model<AdsDocument>,
    private readonly storageService: StorageService,
  ) {}

  async existsAdsByTitle(title: string): Promise<boolean> {
    const count = await this.adsModel.countDocuments({ title }).exec();
    return count > 0;
  }

  async createAd(
    createAdsDto: CreateAdsDto,
    files?: {
      imageUrl?: Express.Multer.File[];
      videoUrl?: Express.Multer.File[];
    },
  ): Promise<AdsEntity> {
    const [adsExists] = await Promise.all([
      this.existsAdsByTitle(createAdsDto.title),
    ]);

    if (adsExists) {
      throw new ConflictException(`Title already in use.`);
    }

    if (files?.imageUrl?.[0]) {
      const imageFile = files.imageUrl[0];
      const fileName = generateCleanFilename(imageFile.originalname);
      const imageKey = `ads/images/${fileName}`;
      createAdsDto.imageUrl = await this.storageService.uploadFile(
        imageFile.buffer,
        imageKey,
        imageFile.mimetype,
      );
    }

    if (files?.videoUrl?.[0]) {
      const videoFile = files.videoUrl[0];
      const fileName = generateCleanFilename(videoFile.originalname);
      const videoKey = `ads/videos/${fileName}`;
      createAdsDto.videoUrl = await this.storageService.uploadFile(
        videoFile.buffer,
        videoKey,
        videoFile.mimetype,
      );
    }

    const newAd = new this.adsModel(createAdsDto);
    const savedAd = await newAd.save();

    return plainToInstance(AdsEntity, savedAd.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async deleteAd(id: string): Promise<void> {
    const ad = await this.adsModel.findById(id);
    if (!ad) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    if (ad.imageUrl) {
      const imageKey = this.storageService.extractKeyFromUrl(ad.imageUrl);
      await this.storageService.deleteFile(imageKey).catch((err) => {
        console.log(err);
      });
    }

    if (ad.videoUrl) {
      const videoKey = this.storageService.extractKeyFromUrl(ad.videoUrl);
      await this.storageService.deleteFile(videoKey).catch((err) => {
        console.log(err);
      });
    }

    await this.adsModel.findByIdAndDelete(id);
  }

  async findAll(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResponseEntity<AdsEntity>> {
    const result = await paginateQuery(this.adsModel, {}, paginationOptions, {
      sort: { createdAt: -1 },
    });

    const ads = plainToInstance(AdsEntity, result.items, {
      excludeExtraneousValues: true,
    });

    return new PaginatedResponseEntity({
      items: ads,
      meta: result.meta,
    });
  }

  async updateAd(
    id: string,
    updateAdsDto: UpdateAdsDto,
    files?: {
      imageUrl?: Express.Multer.File[];
      videoUrl?: Express.Multer.File[];
    },
  ): Promise<AdsEntity> {
    const ad = await this.adsModel.findById(id);
    if (!ad) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    if (updateAdsDto.title && updateAdsDto.title !== ad.title) {
      const adsExists = await this.existsAdsByTitle(updateAdsDto.title);
      if (adsExists) {
        throw new ConflictException(`Title already in use.`);
      }
    }

    if (files?.imageUrl?.[0]) {
      if (ad.imageUrl) {
        const oldImageKey = this.storageService.extractKeyFromUrl(ad.imageUrl);
        await this.storageService.deleteFile(oldImageKey).catch((err) => {
          console.log(err);
        });
      }

      const imageFile = files.imageUrl[0];
      const fileName = generateCleanFilename(imageFile.originalname);
      const imageKey = `ads/images/${fileName}`;
      updateAdsDto.imageUrl = await this.storageService.uploadFile(
        imageFile.buffer,
        imageKey,
        imageFile.mimetype,
      );
    }

    if (files?.videoUrl?.[0]) {
      if (ad.videoUrl) {
        const oldVideoKey = this.storageService.extractKeyFromUrl(ad.videoUrl);
        await this.storageService.deleteFile(oldVideoKey).catch((err) => {
          console.log(err);
        });
      }

      const videoFile = files.videoUrl[0];
      const fileName = generateCleanFilename(videoFile.originalname);
      const videoKey = `ads/videos/${fileName}`;
      updateAdsDto.videoUrl = await this.storageService.uploadFile(
        videoFile.buffer,
        videoKey,
        videoFile.mimetype,
      );
    }

    Object.assign(ad, updateAdsDto);
    const updatedAd = await ad.save();

    return plainToInstance(AdsEntity, updatedAd.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async findById(id: string): Promise<AdsEntity> {
    const ad = await this.adsModel.findById(id).exec();

    if (!ad) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    return plainToInstance(AdsEntity, ad.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}

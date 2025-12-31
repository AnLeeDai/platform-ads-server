import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';

import {
  PointBalanceDocument,
  PointHistoryDocument,
} from './schema/point.schema';
import { PaginationOptions } from 'src/common/http';
import { PaginatedResponseEntity } from 'src/common/entities';
import { paginateQuery } from 'src/common/utils/pagination.util';
import { plainToInstance } from 'class-transformer';
import {
  PointBalanceEntity,
  PointHistoryEntity,
  UserPointSummaryEntity,
} from './entities/point.entities';
import { AdjustPointDto } from './dto/update.point.dto';

@Injectable()
export class PointService {
  constructor(
    @Inject('POINT_BALANCE_MODEL')
    private readonly balanceModel: Model<PointBalanceDocument>,
    @Inject('POINT_HISTORY_MODEL')
    private readonly historyModel: Model<PointHistoryDocument>,
  ) {}

  async adjustPoints(
    adjustPointDto: AdjustPointDto,
  ): Promise<PointHistoryEntity> {
    const { userId, amount, description, type } = adjustPointDto;

    let pointBalance = await this.balanceModel.findOne({ userId });
    if (!pointBalance) {
      pointBalance = new this.balanceModel({ userId, balance: 0 });
    }

    const balanceBefore = pointBalance.balance;
    const balanceAfter = balanceBefore + amount;

    pointBalance.balance = balanceAfter;
    await pointBalance.save();

    const history = new this.historyModel({
      userId,
      amount,
      balanceBefore,
      balanceAfter,
      description,
      type,
    });
    const savedHistory = await history.save();

    return plainToInstance(PointHistoryEntity, savedHistory.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async getBalance(userId: string): Promise<PointBalanceEntity> {
    const balance = await this.balanceModel
      .findOne({ userId })
      .populate('userId')
      .exec();

    if (!balance) {
      return plainToInstance(
        PointBalanceEntity,
        { userId: { _id: userId }, balance: 0 },
        { excludeExtraneousValues: true },
      );
    }

    return plainToInstance(PointBalanceEntity, balance.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async getHistory(
    userId: string,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResponseEntity<PointHistoryEntity>> {
    const result = await paginateQuery(
      this.historyModel,
      { userId },
      paginationOptions,
      { sort: { createdAt: -1 }, populate: 'userId' },
    );

    const items = plainToInstance(PointHistoryEntity, result.items, {
      excludeExtraneousValues: true,
    });

    return new PaginatedResponseEntity({
      items,
      meta: result.meta,
    });
  }

  async getUserPointSummary(userId: string): Promise<UserPointSummaryEntity> {
    const balanceDoc = await this.getBalance(userId);
    const historyDocs = await this.historyModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId')
      .exec();

    const history = plainToInstance(PointHistoryEntity, historyDocs, {
      excludeExtraneousValues: true,
    });

    return plainToInstance(
      UserPointSummaryEntity,
      {
        balance: balanceDoc.balance,
        history,
      },
      { excludeExtraneousValues: true },
    );
  }

  async findAllBalances(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResponseEntity<PointBalanceEntity>> {
    const result = await paginateQuery(
      this.balanceModel,
      {},
      paginationOptions,
      { sort: { updatedAt: -1 }, populate: 'userId' },
    );

    const items = plainToInstance(PointBalanceEntity, result.items, {
      excludeExtraneousValues: true,
    });

    return new PaginatedResponseEntity({
      items,
      meta: result.meta,
    });
  }
}

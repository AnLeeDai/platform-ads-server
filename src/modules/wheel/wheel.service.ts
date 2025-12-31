import { Inject, Injectable } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';

import type { AdminInventoryDocument } from 'src/modules/admin-inventory/schema/admin.inventory.schema';
import { AdminInventoryEntity } from 'src/modules/admin-inventory/entities/admin.inventory.entity';
import { UserInventoryService } from 'src/modules/user-inventory/user.inventory.service';
import { WheelSpinResultEntity } from './entities/wheel.entity';

type UserInventoryWriter = {
  addItem: (params: {
    userId: string;
    prizeId: string;
    quantity?: number;
    expiresAt?: Date;
  }) => Promise<void>;
};

@Injectable()
export class WheelService {
  private readonly loseRate = 0.05;
  private readonly loseMessage = 'Better luck next time';

  constructor(
    @Inject('ADMIN_INVENTORY_MODEL')
    private readonly adminInventoryModel: Model<AdminInventoryDocument>,
    @Inject(UserInventoryService)
    private readonly userInventoryService: UserInventoryWriter,
  ) {}

  private isEligible(doc: AdminInventoryDocument): boolean {
    if (!doc.isActive) return false;
    if (!Number.isFinite(doc.probability) || doc.probability <= 0) return false;

    if (!Number.isFinite(doc.quantity) || doc.quantity <= 0) return false;

    if (doc.type === 'COUPON') {
      const qty = doc.quantity ?? 0;
      const exp = doc.expiresAt;
      if (!Number.isFinite(qty) || qty <= 0) return false;
      if (!exp || exp.getTime() <= Date.now()) return false;
    }

    return true;
  }

  private pickWeighted(
    items: AdminInventoryDocument[],
  ): AdminInventoryDocument | null {
    if (items.length === 0) return null;

    // 5% always lose
    const r = Math.random();
    if (r < this.loseRate) return null;

    const total = items.reduce((sum, p) => sum + (p.probability ?? 0), 0);
    if (!Number.isFinite(total) || total <= 0) return null;

    const scaled = (r - this.loseRate) / (1 - this.loseRate);

    let acc = 0;
    for (const p of items) {
      acc += (p.probability ?? 0) / total;
      if (scaled <= acc) return p;
    }

    return items[items.length - 1] ?? null;
  }

  async spin(userId: string): Promise<WheelSpinResultEntity> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return plainToInstance(
        WheelSpinResultEntity,
        { result: 'LOSE', message: this.loseMessage },
        { excludeExtraneousValues: true },
      );
    }

    // Retry a few times to handle coupon race (quantity might hit 0)
    for (let attempt = 0; attempt < 3; attempt++) {
      const candidates = await this.adminInventoryModel
        .find({ isActive: true })
        .exec();

      const eligible = candidates.filter((c) => this.isEligible(c));

      const picked = this.pickWeighted(eligible);
      if (!picked) {
        return plainToInstance(
          WheelSpinResultEntity,
          { result: 'LOSE', message: this.loseMessage },
          { excludeExtraneousValues: true },
        );
      }

      // Always decrement admin stock first (atomic)
      const updated = await this.adminInventoryModel
        .findOneAndUpdate(
          {
            _id: picked._id,
            isActive: true,
            quantity: { $gt: 0 },
            ...(picked.type === 'COUPON'
              ? { type: 'COUPON', expiresAt: { $gt: new Date() } }
              : {}),
          },
          { $inc: { quantity: -1 } },
          { new: true },
        )
        .exec();

      if (!updated) continue;

      const prize = plainToInstance(AdminInventoryEntity, updated.toObject(), {
        excludeExtraneousValues: true,
      });

      // Always store reward into user inventory (claim/apply happens on user confirmation)
      await this.userInventoryService.addItem({
        userId,
        prizeId: String(updated._id),
        quantity: 1,
        ...(updated.type === 'COUPON' ? { expiresAt: updated.expiresAt } : {}),
      });

      return plainToInstance(
        WheelSpinResultEntity,
        {
          result: 'WIN',
          message: `You won: ${updated.title}`,
          prize,
        },
        { excludeExtraneousValues: true },
      );
    }

    return plainToInstance(
      WheelSpinResultEntity,
      { result: 'LOSE', message: this.loseMessage },
      { excludeExtraneousValues: true },
    );
  }
}

import { Expose, Transform, Type } from 'class-transformer';

export class PointUserEntity {
  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { _id?: unknown; id?: unknown };
    const id = source._id ?? source.id;
    return id?.toString();
  })
  _id: string;

  @Expose()
  username: string;
}

export class PointBalanceEntity {
  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { _id?: unknown; id?: unknown };
    const id = source._id ?? source.id;
    return id?.toString();
  })
  _id: string;

  @Expose()
  @Type(() => PointUserEntity)
  userId: PointUserEntity;

  @Expose()
  balance: number;

  @Expose()
  updatedAt: Date;
}

export class PointHistoryEntity {
  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { _id?: unknown; id?: unknown };
    const id = source._id ?? source.id;
    return id?.toString();
  })
  _id: string;

  @Expose()
  @Type(() => PointUserEntity)
  userId: PointUserEntity;

  @Expose()
  amount: number;

  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { amount: number };
    return source.amount >= 0 ? 'plus' : 'minus';
  })
  action: 'plus' | 'minus';

  @Expose()
  balanceBefore: number;

  @Expose()
  balanceAfter: number;

  @Expose()
  description: string;

  @Expose()
  type: string;

  @Expose()
  createdAt: Date;
}

export class UserPointSummaryEntity {
  @Expose()
  balance: number;

  @Expose()
  @Type(() => PointHistoryEntity)
  history: PointHistoryEntity[];
}

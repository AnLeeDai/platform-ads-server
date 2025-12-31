import { Expose, Transform } from 'class-transformer';

export class AdsTransform {
  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { _id?: unknown; id?: unknown };
    const id = source._id ?? source.id;
    return id?.toString();
  })
  _id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  imageUrl: string;

  @Expose()
  videoUrl: string;

  @Expose()
  point: number;

  @Expose()
  duration: number;
}

export class AdsEntity {
  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { _id?: unknown; id?: unknown };
    const id = source._id ?? source.id;
    return id?.toString();
  })
  _id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  imageUrl: string;

  @Expose()
  videoUrl: string;

  @Expose()
  point: number;

  @Expose()
  duration: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<AdsEntity>) {
    Object.assign(this, partial);
  }
}

import { Expose, Transform } from 'class-transformer';

export class RoleTransform {
  @Transform(({ obj }) => {
    const source = obj as { _id?: unknown; id?: unknown };
    const id = source._id ?? source.id;
    return id?.toString();
  })
  _id: string;

  @Expose()
  name: string;
}

export class RoleEntity {
  @Expose()
  @Transform(({ value }: { value: unknown }) => value?.toString())
  _id: string;

  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<RoleEntity>) {
    Object.assign(this, partial);
  }
}

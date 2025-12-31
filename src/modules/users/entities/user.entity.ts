import { Exclude, Expose, Transform, Type } from 'class-transformer';

export class UserRoleEntity {
  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { _id?: unknown; id?: unknown };
    const id = source._id ?? source.id;
    return id?.toString();
  })
  _id: string;

  @Expose()
  name: string;
}

export class UserEntity {
  @Expose()
  @Transform(({ obj }) => {
    const source = obj as { _id?: unknown; id?: unknown };
    const id = source._id ?? source.id;
    return id?.toString();
  })
  _id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  phoneNumber: string;

  @Exclude()
  password: string;

  @Expose()
  @Type(() => UserRoleEntity)
  roles: UserRoleEntity[];

  @Expose()
  avatarUrl?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

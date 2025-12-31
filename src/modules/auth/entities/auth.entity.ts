import { Expose, Type } from 'class-transformer';
import { UserEntity } from 'src/modules/users/entities/user.entity';

export class LoginResponseEntity {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  @Type(() => UserEntity)
  user: UserEntity;

  constructor(partial: Partial<LoginResponseEntity>) {
    Object.assign(this, partial);
  }
}

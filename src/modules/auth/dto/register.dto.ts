import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDto {
  @Expose()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Expose()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/, {
    message:
      'password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
  })
  password: string;

  @Expose()
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phoneNumber: string;
}

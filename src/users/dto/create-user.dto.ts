import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  MaxLength,
} from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-z0-9_]+$/)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}

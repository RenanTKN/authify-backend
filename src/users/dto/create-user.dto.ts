import {
  emailField,
  passwordField,
  usernameField,
} from "src/domain/user/user.fields";

export class CreateUserDto {
  @emailField()
  email: string;

  @usernameField()
  username: string;

  @passwordField()
  password: string;
}

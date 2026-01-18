import { passwordField, usernameField } from "src/domain/user/user.fields";

export class LoginDto {
  @usernameField()
  username: string;

  @passwordField()
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
//successful server responses
export class LoginOkResponse {
  @ApiProperty({ example: 'Пользователь авторизован' })
  message = 'Пользователь авторизован';
}

export class RegistrationOkResponse {
  @ApiProperty({ example: 'Пользователь зарегистрирован' })
  message = 'Пользователь зарегистрирован';
}

export class LogoutOkResponse {
  @ApiProperty({ example: 'Пользователь вышел из своей сессии' })
  message = 'Пользователь вышел из своей сессии';
}

export class FullLogoutOkResponse {
  @ApiProperty({ example: 'Пользователь вышел из всех сессий' })
  message = 'Пользователь вышел из всех сессий';
}

export class RefreshOkResponse {
  @ApiProperty({ example: 'access_token обновлён' })
  message = 'access_token и refresh_token обновлены';
}

export class ResetOkresponse {
  @ApiProperty({ example: 'Ссылка для сброса отправлена на почту: testmail@gmail.com' })
  message = 'Ссылка для сброса отправлена на почту: testmail@gmail.com';
}

export class ResetPasswordOkresponse {
  @ApiProperty({
    example: 'Пароль успешно сменён'
  })
  message = 'Пароль успешно сменён';
}

export class RequestConfirmOkresponse {
  @ApiProperty({
    example: 'Ссылка для подтверждения отправлена на почту'
  })
  message = 'Ссылка для подтверждения отправлена на почту';
}

export class ConfirmEmailOkresponse {
  @ApiProperty({
    example: 'Почта подтверждена'
  })
  message = 'Почта подтверждена';
}

export class RequestResetEmail{
  constructor(private email: string){}
  @ApiProperty({
    example: 'Ссылка для сброса отправлена на почту: email@gmail.com'
  })
  message = `Ссылка для сброса отправлена на почту: ${this.email}`;
}
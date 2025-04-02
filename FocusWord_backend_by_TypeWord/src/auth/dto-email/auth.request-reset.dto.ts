import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetDto {
	@ApiProperty({
		example: 'test@gmail.com',
		description: 'Почта пользователя для сброса пароля',
	})
	@IsString()
	readonly email: string;
}
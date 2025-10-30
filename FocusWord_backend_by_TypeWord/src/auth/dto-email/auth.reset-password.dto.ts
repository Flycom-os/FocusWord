import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
	@ApiProperty({
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY5NjI2MzU3MCwiZXhwIjoxNjk2MjY0MTcwfQ.BsjP-hOOt2_Dx5PZaVUOvUh7QzXFEV-8obJHDXwB0-c',
		description: 'Токен для сброса пароля',
	})
	@IsString()
	readonly token: string;

	@ApiProperty({
		example: 'qwerty123',
		description: 'Новый пароль пользователя',
	})
	@IsString()
	readonly newPassword: string;
}
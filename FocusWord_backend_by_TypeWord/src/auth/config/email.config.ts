import { registerAs } from '@nestjs/config';
//mailing config
export default registerAs('email', () => ({
  transport: {
    service: 'gmail',
    auth: {
      user: 'invite4googl@gmail.com',
      pass: 'password',
    },
  },
}));

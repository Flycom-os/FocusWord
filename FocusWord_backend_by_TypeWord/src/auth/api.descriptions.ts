//description for swagger api
export const loginDescription: string =
  'Если у пользователя на момент выполнения запроса отсутствует refresh_token, ' +
  'то после выполнения запроса у пользователя в куках появятся refresh_token и access_token. Если на момент ' +
  'выполнения запроса был refresh_token, то появится только access_token, а refresh_token останется без изменений.';
export const logoutDescription =
  'После выполнения запроса у пользователя удалится access_token из куков. refresh_token останется неизменным.';
export const fullLogoutDescription: string =
  'После выполнения запроса у пользователя удалятся access_token и ' +
  'refresh_token из куков. Также будет удалён refresh_token из базы данных.';
export const refreshDescription: string =
  'После выполнения запроса у пользователя в куках обновится access_token ' +
  'при условии, что он ещё есть. В противном случае запрос не выполнится. refresh_token останется неизменным.';

export const requestReset: string =
  'После выполнения запроса отправляется письмо на почту вместе с ссылкой/токеном \n' +
  'Ссылка имеет вид: http://localhost:5000/password-reset/TOKEN'

export const passwordReset: string =
  'Запрос выполняется после того как в форме (в которую перейдёт с помощью ссылки из письма)' +
  'пользователь введёт новый пароль'

export const requestConfirm: string = 'После выполнения запроса отправляется письмо на почту вместе с ссылкой/токеном' +
  ' ССЫЛКА не является прямым обращением к API confirm-email'
const axios = require('axios');

async function createTestPage() {
  try {
    const API_URL = 'http://localhost:1331';
    
    // Сначала получим токен авторизации (нужно будет ввести логин/пароль)
    console.log('Создание тестовой страницы...');
    
    // Данные для тестовой страницы
    const pageData = {
      title: 'Тестовая страница',
      slug: 'test',
      content: '<h1>Это тестовая страница</h1><p>Контент для проверки работы публичного API.</p>',
      status: 'published',
      template: 'default',
      seoTitle: 'Тестовая страница - FocusWord',
      seoDescription: 'Это тестовая страница для проверки работы публичного API'
    };

    // Создаем страницу (потребуется токен)
    const response = await axios.post(`${API_URL}/pages`, pageData, {
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE' // Нужен токен админа
      }
    });
    
    console.log('Страница успешно создана:', response.data);
    console.log('Теперь можно перейти на: http://localhost:3000/test');
    
  } catch (error) {
    console.error('Ошибка при создании страницы:', error.response?.data || error.message);
  }
}

createTestPage();

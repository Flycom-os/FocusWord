'use client';

export default function MiddlewareTestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Middleware Test Page</h1>
      <p className="mb-4">Если вы видите эту страницу, то middleware либо не работает, либо пропустило вас.</p>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Инструкции:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Откройте консоль браузера (F12)</li>
          <li>Посмотрите вкладку "Network" и "Console"</li>
          <li>Обновите эту страницу</li>
          <li>Если middleware работает, вы должны увидеть логи с "=== MIDDLEWARE DEBUG ==="</li>
          <li>Если логов нет, значит middleware не запускается</li>
        </ol>
      </div>
      
      <div className="bg-yellow-100 p-4 rounded-lg mt-4">
        <h2 className="font-semibold mb-2">Возможные проблемы:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Middleware файл не в корне проекта</li>
          <li>Next.js кэширует middleware</li>
          <li>Нужно перезапустить сервер</li>
          <li>Проблема с matcher конфигурацией</li>
        </ul>
      </div>
    </div>
  );
}

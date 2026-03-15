'use client';

import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const IncidentsPage = () => {
  const incidents = [
    {
      date: '25 мая',
      dayOfWeek: 'суббота',
      title: 'Инцидент с базой данных',
      time: '14:30',
      description: 'Произошло кратковременное отключение основной базы данных, что привело к недоступности сервиса в течение 15 минут. Инженерная команда оперативно отреагировала и восстановила работу системы. Причиной инцидента стала плановая перезагрузка серверов для установки обновлений безопасности.'
    },
    {
      date: '27 мая',
      dayOfWeek: 'понедельник',
      title: 'Медленная загрузка страниц',
      time: '09:15',
      description: 'Пользователи сообщали о медленной загрузке страниц в утренние часы. Проблема была связана с высокой нагрузкой на CDN-серверы. Мы быстро переключились на резервные серверы и оптимизировали кэширование, что позволило восстановить нормальную скорость работы.'
    },
    {
      date: '28 мая',
      dayOfWeek: 'вторник',
      title: 'Ошибка аутентификации',
      time: '16:45',
      description: 'Некоторые пользователи испытывали трудности с входом в систему из-за сбоя в сервисе аутентификации. Проблема была устранена в течение 30 минут. Мы внедрили дополнительные механизмы мониторинга для предотвращения подобных инцидентов в будущем.'
    }
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const currentWeek = [2, 1, 0, 1, 0, 2, 0]; // Количество инцидентов по дням

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Заголовок и уведомление */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Trailing 2 Weeks Incidents</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <AlertCircle size={20} />
              <span className="text-sm">
                Инциденты отображаются в течение 2 недель после их возникновения. 
                Старые инциденты автоматически архивируются.
              </span>
            </div>
          </div>
        </div>

        {/* Визуализация инцидентов по дням недели */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Инциденты за последнюю неделю</h2>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-2">{day}</div>
                <div className={`h-20 rounded-lg flex items-center justify-center ${
                  currentWeek[index] > 0 
                    ? currentWeek[index] === 1 
                      ? 'bg-orange-100 border border-orange-200' 
                      : 'bg-red-100 border border-red-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  {currentWeek[index] > 0 && (
                    <span className={`text-sm font-medium ${
                      currentWeek[index] === 1 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {currentWeek[index]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Список инцидентов */}
        <div className="space-y-6">
          {incidents.map((incident, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 rounded-lg p-2">
                    <Calendar size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{incident.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="font-medium">{incident.date}</span>
                      <span className="text-gray-400">•</span>
                      <span>{incident.dayOfWeek}</span>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{incident.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{incident.description}</p>
            </div>
          ))}
        </div>

        {/* Информация о статусе */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">Все системы работают в штатном режиме</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentsPage;

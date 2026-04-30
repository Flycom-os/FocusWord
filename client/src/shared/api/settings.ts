import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface SettingsDto {
  id: number;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  value: string;
}

export interface SettingsGroup {
  category: string;
  title: string;
  description: string;
  settings: {
    key: string;
    title: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    defaultValue: string;
    validation?: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
    };
  }[];
}

const authHeaders = (token: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : {};

export const settingsApi = {
  // Получить все настройки
  getAll: async (token: string | null): Promise<SettingsDto[]> => {
    const { data } = await axios.get<SettingsDto[]>(`${API_URL}/settings`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить настройку по ключу
  getByKey: async (token: string | null, key: string): Promise<SettingsDto> => {
    const { data } = await axios.get<SettingsDto>(`${API_URL}/settings/${key}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить настройки по категории
  getByCategory: async (token: string | null, category: string): Promise<SettingsDto[]> => {
    const { data } = await axios.get<SettingsDto[]>(`${API_URL}/settings/category/${category}`, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Обновить настройку
  update: async (token: string | null, key: string, data: UpdateSettingsDto): Promise<SettingsDto> => {
    const { data: result } = await axios.put<SettingsDto>(`${API_URL}/settings/${key}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Массовое обновление настроек
  updateMultiple: async (token: string | null, settings: { key: string; value: string }[]): Promise<SettingsDto[]> => {
    const { data } = await axios.put<SettingsDto[]>(`${API_URL}/settings/batch`, { settings }, {
      headers: authHeaders(token),
    });
    return data;
  },

  // Получить определение групп настроек
  getSettingsGroups: async (): Promise<SettingsGroup[]> => {
    // Возвращаем предопределенные группы настроек
    return [
      {
        category: 'general',
        title: 'Общие настройки',
        description: 'Основные настройки сайта',
        settings: [
          {
            key: 'site_name',
            title: 'Название сайта',
            description: 'Название вашего сайта',
            type: 'string',
            defaultValue: 'FocusWord',
            validation: { required: true }
          },
          {
            key: 'site_description',
            title: 'Описание сайта',
            description: 'Краткое описание сайта',
            type: 'string',
            defaultValue: '',
            validation: { max: 500 }
          },
          {
            key: 'site_url',
            title: 'URL сайта',
            description: 'Основной URL сайта',
            type: 'string',
            defaultValue: 'https://focusword.com',
            validation: { required: true, pattern: '^https?://.+' }
          },
          {
            key: 'maintenance_mode',
            title: 'Режим обслуживания',
            description: 'Включить режим обслуживания',
            type: 'boolean',
            defaultValue: 'false'
          }
        ]
      },
      {
        category: 'appearance',
        title: 'Внешний вид',
        description: 'Настройки внешнего вида сайта',
        settings: [
          {
            key: 'theme_mode',
            title: 'Режим темы',
            description: 'Переключение между дневной и ночной темой',
            type: 'string',
            defaultValue: 'light'
          },
          {
            key: 'theme',
            title: 'Тема',
            description: 'Основная тема сайта',
            type: 'string',
            defaultValue: 'default'
          },
          {
            key: 'primary_color',
            title: 'Основной цвет',
            description: 'Основной цвет темы',
            type: 'string',
            defaultValue: '#3b82f6',
            validation: { pattern: '^#[0-9a-fA-F]{6}$' }
          },
          {
            key: 'logo_url',
            title: 'URL логотипа',
            description: 'URL логотипа сайта',
            type: 'string',
            defaultValue: ''
          },
          {
            key: 'favicon_url',
            title: 'URL фавикона',
            description: 'URL фавикона сайта',
            type: 'string',
            defaultValue: ''
          }
        ]
      },
      {
        category: 'email',
        title: 'Email настройки',
        description: 'Настройки отправки email',
        settings: [
          {
            key: 'smtp_host',
            title: 'SMTP хост',
            description: 'SMTP сервер для отправки email',
            type: 'string',
            defaultValue: ''
          },
          {
            key: 'smtp_port',
            title: 'SMTP порт',
            description: 'Порт SMTP сервера',
            type: 'number',
            defaultValue: '587',
            validation: { min: 1, max: 65535 }
          },
          {
            key: 'smtp_username',
            title: 'SMTP пользователь',
            description: 'Имя пользователя SMTP',
            type: 'string',
            defaultValue: ''
          },
          {
            key: 'smtp_password',
            title: 'SMTP пароль',
            description: 'Пароль SMTP',
            type: 'string',
            defaultValue: ''
          },
          {
            key: 'email_from',
            title: 'Email отправителя',
            description: 'Email адрес для отправки',
            type: 'string',
            defaultValue: 'noreply@focusword.com',
            validation: { required: true, pattern: '^[^@]+@[^@]+\.[^@]+$' }
          }
        ]
      },
      {
        category: 'security',
        title: 'Безопасность',
        description: 'Настройки безопасности сайта',
        settings: [
          {
            key: 'enable_2fa',
            title: 'Двухфакторная аутентификация',
            description: 'Включить 2FA для пользователей',
            type: 'boolean',
            defaultValue: 'false'
          },
          {
            key: 'session_timeout',
            title: 'Время сессии',
            description: 'Время жизни сессии в минутах',
            type: 'number',
            defaultValue: '60',
            validation: { min: 5, max: 1440 }
          },
          {
            key: 'max_login_attempts',
            title: 'Макс. попыток входа',
            description: 'Максимальное количество попыток входа',
            type: 'number',
            defaultValue: '5',
            validation: { min: 1, max: 20 }
          },
          {
            key: 'lockout_duration',
            title: 'Время блокировки',
            description: 'Время блокировки в минутах',
            type: 'number',
            defaultValue: '15',
            validation: { min: 1, max: 1440 }
          }
        ]
      },
      {
        category: 'analytics',
        title: 'Аналитика',
        description: 'Настройки аналитики и метрик',
        settings: [
          {
            key: 'google_analytics_id',
            title: 'Google Analytics ID',
            description: 'ID Google Analytics',
            type: 'string',
            defaultValue: ''
          },
          {
            key: 'yandex_metrica_id',
            title: 'Яндекс.Метрика ID',
            description: 'ID Яндекс.Метрики',
            type: 'string',
            defaultValue: ''
          },
          {
            key: 'enable_tracking',
            title: 'Включить отслеживание',
            description: 'Включить отслеживание пользователей',
            type: 'boolean',
            defaultValue: 'true'
          }
        ]
      },
      {
        category: 'database',
        title: 'Управление базой данных',
        description: 'Импорт и экспорт базы данных',
        settings: [
          {
            key: 'auto_backup',
            title: 'Автоматическое резервное копирование',
            description: 'Включить автоматическое создание резервных копий',
            type: 'boolean',
            defaultValue: 'true'
          },
          {
            key: 'backup_frequency',
            title: 'Частота резервного копирования',
            description: 'Как часто создавать резервные копии',
            type: 'string',
            defaultValue: 'daily'
          },
          {
            key: 'max_backups',
            title: 'Максимальное количество копий',
            description: 'Максимальное количество хранимых резервных копий',
            type: 'number',
            defaultValue: '7',
            validation: { min: 1, max: 30 }
          }
        ]
      }
    ];
  },

  // Экспорт базы данных
  exportDatabase: async (token: string | null): Promise<Blob> => {
    const response = await axios.get(`${API_URL}/database/export`, {
      headers: authHeaders(token),
      responseType: 'blob'
    });
    return response.data;
  },

  // Импорт базы данных
  importDatabase: async (token: string | null, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/database/import`, formData, {
      headers: {
        ...authHeaders(token),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

// Экспортируем функции для совместимости
export const fetchSettings = settingsApi.getAll;
export const fetchSettingByKey = settingsApi.getByKey;
export const fetchSettingsByCategory = settingsApi.getByCategory;
export const updateSetting = settingsApi.update;
export const updateMultipleSettings = settingsApi.updateMultiple;

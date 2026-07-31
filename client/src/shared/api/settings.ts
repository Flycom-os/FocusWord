import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export interface SettingsDto {
  id: number;
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json";
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
    type: "string" | "number" | "boolean" | "json";
    defaultValue: string;
    validation?: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
    };
  }[];
}

const authHeaders = (token: string | null) => (token ? { Authorization: `Bearer ${token}` } : {});

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
  update: async (
    token: string | null,
    key: string,
    data: UpdateSettingsDto,
  ): Promise<SettingsDto> => {
    const { data: result } = await axios.put<SettingsDto>(`${API_URL}/settings/${key}`, data, {
      headers: authHeaders(token),
    });
    return result;
  },

  // Массовое обновление настроек
  updateMultiple: async (
    token: string | null,
    settings: { key: string; value: string }[],
    force: boolean = false,
  ): Promise<SettingsDto[]> => {
    const qs = force ? "?force=true" : "";
    const { data } = await axios.put<SettingsDto[]>(
      `${API_URL}/settings/batch${qs}`,
      { settings },
      {
        headers: authHeaders(token),
      },
    );
    return data;
  },

  // Получить определение групп настроек
  getSettingsGroups: async (): Promise<SettingsGroup[]> => {
    // Возвращаем предопределенные группы настроек
    return [
      {
        category: "general",
        title: "General Settings",
        description: "Main configuration options for the website",
        settings: [
          {
            key: "site_name",
            title: "Site Name",
            description: "The name of your website",
            type: "string",
            defaultValue: "FocusWord",
            validation: { required: true },
          },
          {
            key: "site_description",
            title: "Site Description",
            description: "A short description of the website",
            type: "string",
            defaultValue: "",
            validation: { max: 500 },
          },
          {
            key: "site_url",
            title: "Site URL",
            description: "The primary URL of the website",
            type: "string",
            defaultValue: "https://focusword.com",
            validation: { required: true, pattern: "^https?://.+" },
          },
          {
            key: "maintenance_mode",
            title: "Maintenance Mode",
            description: "Enable maintenance mode",
            type: "boolean",
            defaultValue: "false",
          },
        ],
      },
      {
        category: "appearance",
        title: "Appearance",
        description: "Website theme and appearance settings",
        settings: [
          {
            key: "theme_mode",
            title: "Theme Mode",
            description: "Switch between light and dark themes",
            type: "string",
            defaultValue: "light",
          },
          {
            key: "theme",
            title: "Theme",
            description: "The main website theme",
            type: "string",
            defaultValue: "default",
          },
          {
            key: "primary_color",
            title: "Primary Color",
            description: "The primary color of the theme",
            type: "string",
            defaultValue: "#3b82f6",
            validation: { pattern: "^#[0-9a-fA-F]{6}$" },
          },
          {
            key: "logo_url",
            title: "Logo URL",
            description: "URL of the website logo",
            type: "string",
            defaultValue: "",
          },
          {
            key: "favicon_url",
            title: "Favicon URL",
            description: "URL of the website favicon",
            type: "string",
            defaultValue: "",
          },
        ],
      },
      {
        category: "email",
        title: "Email Settings",
        description: "Configuration for outgoing email notifications",
        settings: [
          {
            key: "smtp_host",
            title: "SMTP Host",
            description: "SMTP server host name",
            type: "string",
            defaultValue: "",
          },
          {
            key: "smtp_port",
            title: "SMTP Port",
            description: "SMTP server port number",
            type: "number",
            defaultValue: "587",
            validation: { min: 1, max: 65535 },
          },
          {
            key: "smtp_username",
            title: "SMTP Username",
            description: "Username for SMTP authentication",
            type: "string",
            defaultValue: "",
          },
          {
            key: "smtp_password",
            title: "SMTP Password",
            description: "Password for SMTP authentication",
            type: "string",
            defaultValue: "",
          },
          {
            key: "mailer_config",
            title: "Mailer Config (JSON)",
            description:
              'JSON configuration for mailer (e.g. provider, extra options) like {"host":...,"port":...}.',
            type: "json",
            defaultValue: "{}",
          },
          {
            key: "email_from",
            title: "Sender Email",
            description: "The email address outgoing mails will be sent from",
            type: "string",
            defaultValue: "noreply@focusword.com",
            validation: { required: true, pattern: "^[^@]+@[^@]+.[^@]+$" },
          },
        ],
      },
      {
        category: "security",
        title: "Security",
        description: "Website security and authentication policies",
        settings: [
          {
            key: "enable_2fa",
            title: "Two-Factor Authentication",
            description: "Enable 2FA for website users",
            type: "boolean",
            defaultValue: "false",
          },
          {
            key: "session_timeout",
            title: "Session Timeout",
            description: "Session lifetime duration in minutes",
            type: "number",
            defaultValue: "60",
            validation: { min: 5, max: 1440 },
          },
          {
            key: "max_login_attempts",
            title: "Max Login Attempts",
            description: "Maximum number of allowed login attempts",
            type: "number",
            defaultValue: "5",
            validation: { min: 1, max: 20 },
          },
          {
            key: "lockout_duration",
            title: "Lockout Duration",
            description: "Account lockout duration in minutes",
            type: "number",
            defaultValue: "15",
            validation: { min: 1, max: 1440 },
          },
        ],
      },
      {
        category: "analytics",
        title: "Analytics",
        description: "Settings for visitor analytics and metrics tracking",
        settings: [
          {
            key: "google_analytics_id",
            title: "Google Analytics ID",
            description: "ID parameter for Google Analytics",
            type: "string",
            defaultValue: "",
          },
          {
            key: "yandex_metrica_id",
            title: "Yandex Metrika ID",
            description: "ID parameter for Yandex Metrica",
            type: "string",
            defaultValue: "",
          },
          {
            key: "enable_tracking",
            title: "Enable Tracking",
            description: "Enable user activity tracking",
            type: "boolean",
            defaultValue: "true",
          },
        ],
      },
      {
        category: "database",
        title: "Database Management",
        description: "Database export and import configuration",
        settings: [
          {
            key: "auto_backup",
            title: "Automatic Backup",
            description: "Enable automated database backups",
            type: "boolean",
            defaultValue: "true",
          },
          {
            key: "backup_frequency",
            title: "Backup Frequency",
            description: "How often backups should be created",
            type: "string",
            defaultValue: "daily",
          },
          {
            key: "max_backups",
            title: "Max Backups Limit",
            description: "Maximum number of stored backup archives",
            type: "number",
            defaultValue: "7",
            validation: { min: 1, max: 30 },
          },
        ],
      },
    ];
  },

  // Экспорт базы данных
  exportDatabase: async (token: string | null): Promise<Blob> => {
    const response = await axios.get(`${API_URL}/database/export`, {
      headers: authHeaders(token),
      responseType: "blob",
    });
    return response.data;
  },

  // Импорт базы данных
  importDatabase: async (token: string | null, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_URL}/database/import`, formData, {
      headers: {
        ...authHeaders(token),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Test mailer with transient config
  testMailer: async (
    token: string | null,
    to: string,
    mailerConfig: any,
    subject?: string,
    text?: string,
    html?: string,
  ) => {
    const body: any = {
      to,
      subject: subject || "Test email from FocusWord",
      text: text || "Test",
      html,
    };
    if (mailerConfig) {
      body.mailerConfig =
        typeof mailerConfig === "string" ? mailerConfig : JSON.stringify(mailerConfig);
    }
    const { data } = await axios.post(`${API_URL}/mailer/test`, body, {
      headers: authHeaders(token),
    });
    return data;
  },
};

// Экспортируем функции для совместимости
export const fetchSettings = settingsApi.getAll;
export const fetchSettingByKey = settingsApi.getByKey;
export const fetchSettingsByCategory = settingsApi.getByCategory;
export const updateSetting = settingsApi.update;
export const updateMultipleSettings = settingsApi.updateMultiple;

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/shared/ui/Input/ui-input";
import Button from "@/src/shared/ui/Button/ui-button";
import { fetchSettings, updateMultipleSettings, settingsApi } from "@/src/shared/api/settings";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useTheme } from "next-themes";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [settingsGroups, setSettingsGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    if (accessToken) {
      loadSettings();
    }
  }, [accessToken]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Try to get groups from the already-imported settingsApi first (synchronous)
      let groups: any[] = [];
      try {
        groups = await settingsApi.getSettingsGroups();
      } catch (err) {
        // Fallback to dynamic import if synchronous call fails
        try {
          groups = await import("@/src/shared/api/settings").then((m) => m.settingsApi.getSettingsGroups());
        } catch (err2) {
          // eslint-disable-next-line no-console
          console.error('SettingsPage: failed to load settings groups via dynamic import', err2);
        }
      }
      const allSettings = await fetchSettings(accessToken);

      // Normalize response: backend may return { settings: [...] } or an array
      const settingsArray = Array.isArray(allSettings)
        ? allSettings
        : allSettings && Array.isArray((allSettings as any).settings)
        ? (allSettings as any).settings
        : [];

      // Debug logging to help troubleshoot empty UI
      // eslint-disable-next-line no-console
      console.log("SettingsPage: loaded groups:", groups);
      // eslint-disable-next-line no-console
      console.log("SettingsPage: fetched settings:", allSettings);

      // Создаем объект с текущими значениями
      const initialData: Record<string, string> = {};
      settingsArray.forEach((setting: any) => {
        initialData[setting.key] = setting.value;
      });

      if (initialData.theme_mode && initialData.theme_mode !== resolvedTheme) {
        setTheme(initialData.theme_mode);
      }

      setFormData(initialData);
      setSettingsGroups(groups);

      // Ensure activeTab exists in groups (avoid empty render)
      if (groups && groups.length > 0) {
        const hasActive = groups.find((g: any) => g.category === activeTab);
        if (!hasActive) setActiveTab(groups[0].category);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('SettingsPage: loadSettings error', error);
      showToast("Ошибка при загрузке настроек", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    if (key === "theme_mode") {
      setTheme(value);
    }
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
        key,
        value,
      }));

      // Protected keys must be updated with force flag
      const PROTECTED_DEFAULT_KEYS = [
        'theme_mode',
        'theme',
        'site_name',
        'site_description',
        'site_url',
        'maintenance_mode',
        'auto_backup',
        'backup_frequency',
        'max_backups',
      ];

      const blocked = settingsToUpdate.map(s => s.key).filter(k => PROTECTED_DEFAULT_KEYS.includes(k));
      let force = false;
      if (blocked.length > 0) {
        const confirmMsg = `The following settings are protected and require force to override: ${blocked.join(', ')}. Proceed and force update?`;
        force = window.confirm(confirmMsg);
        if (!force) {
          showToast('Обновление защищённых настроек отменено', 'warning');
          setSaving(false);
          return;
        }
      }

      await updateMultipleSettings(accessToken, settingsToUpdate, force);

      // Apply theme change if theme_mode was updated
      if (formData.theme_mode) {
        setTheme(formData.theme_mode);
      }

      showToast("Настройки сохранены", "success");
    } catch (error) {
      showToast("Ошибка при сохранении настроек", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleExportDatabase = async () => {
    try {
      setExporting(true);
      const blob = await settingsApi.exportDatabase(accessToken);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("База данных успешно экспортирована", "success");
    } catch (error) {
      showToast("Ошибка при экспорте базы данных", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      await settingsApi.importDatabase(accessToken, file);
      showToast("База данных успешно импортирована", "success");
      // Reload settings after import
      loadSettings();
    } catch (error) {
      showToast("Ошибка при импорте базы данных", "error");
    } finally {
      setImporting(false);
      // Clear file input
      event.target.value = "";
    }
  };

  const renderField = (setting: any) => {
    const value = formData[setting.key] || setting.defaultValue;

    switch (setting.type) {
      case "boolean":
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className={styles.select}
          >
            <option value="true">Да</option>
            <option value="false">Нет</option>
          </select>
        );
      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className={styles.input}
            min={setting.validation?.min}
            max={setting.validation?.max}
          />
        );
      case "json":
        // Special-case mailer_config to add validation + test button
        if (setting.key === 'mailer_config') {
          let parsedOk = true;
          try {
            if (value && value.trim().length > 0) JSON.parse(value);
          } catch (e) {
            parsedOk = false;
          }

          const handleTest = async () => {
            const to = window.prompt('Enter recipient email for test:');
            if (!to) return;
            try {
              const cfg = value && value.trim().length > 0 ? JSON.parse(value) : {};
              setSaving(true);
              const res = await import('@/src/shared/api/settings').then(m => m.settingsApi.testMailer(accessToken, to, cfg));
              showToast('Test email sent (check response)', 'success');
              console.log('Mail test response', res);
            } catch (err) {
              showToast('Mailer test failed: ' + (err?.message || String(err)), 'error');
            } finally {
              setSaving(false);
            }
          };

          return (
            <div>
              <textarea
                value={value}
                onChange={(e) => handleInputChange(setting.key, e.target.value)}
                className={styles.textarea}
                rows={6}
                placeholder="JSON формат"
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <button type="button" onClick={handleTest} className={styles.saveButton} disabled={!parsedOk || saving}>
                  Test config
                </button>
                <span style={{ color: parsedOk ? 'green' : 'red' }}>{parsedOk ? 'Valid JSON' : 'Invalid JSON'}</span>
              </div>
            </div>
          );
        }

        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="JSON формат"
          />
        );
      default:
        // Special handling for theme_mode
        if (setting.key === "theme_mode") {
          return (
            <div className={styles.themeSwitcher}>
              <button
                type="button"
                className={`${styles.themeButton} ${value === "light" ? styles.active : ""}`}
                onClick={() => handleInputChange(setting.key, "light")}
              >
                ☀️ Дневная
              </button>
              <button
                type="button"
                className={`${styles.themeButton} ${value === "dark" ? styles.active : ""}`}
                onClick={() => handleInputChange(setting.key, "dark")}
              >
                🌙 Ночная
              </button>
            </div>
          );
        }

        return (
          <Input
            type={
              setting.key.includes("password")
                ? "password"
                : setting.key.includes("url")
                  ? "url"
                  : "text"
            }
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className={styles.input}
            placeholder={setting.description}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Загрузка настроек...</p>
      </div>
    );
  }

  if (settingsGroups.length === 0) {
    return (
      <div className={styles.loading}>
        <p>Нет доступных групп настроек. Проверьте консоль и сетевые запросы.</p>
      </div>
    );
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <h1>Настройки сайта</h1>
        <p>Управление параметрами и конфигурацией сайта</p>
      </div>

      <div className={styles.tabs}>
        {settingsGroups.map((group) => (
          <button
            key={group.category}
            onClick={() => setActiveTab(group.category)}
            className={`${styles.tab} ${activeTab === group.category ? styles.active : ""}`}
          >
            {group.title}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {settingsGroups
          .filter((group) => group.category === activeTab)
          .map((group) => (
            <div key={group.category} className={styles.settingsGroup}>
              <div className={styles.groupHeader}>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>

              <div className={styles.settingsGrid}>
                {group.settings.map((setting: any) => (
                  <div key={setting.key} className={styles.settingField}>
                    <label className={styles.label}>
                      {setting.title}
                      {setting.validation?.required && <span className={styles.required}>*</span>}
                    </label>
                    <p className={styles.description}>{setting.description}</p>
                    {renderField(setting)}
                  </div>
                ))}

                {/* Add database import/export buttons for database category */}
                {group.category === "database" && (
                  <div className={styles.databaseActions}>
                    <h3>Управление базой данных</h3>
                    <div className={styles.buttonGroup}>
                      <Button
                        onClick={handleExportDatabase}
                        disabled={exporting}
                        className={styles.exportButton}
                      >
                        {exporting ? "Экспорт..." : "📤 Экспорт БД"}
                      </Button>
                      <div className={styles.importWrapper}>
                        <input
                          type="file"
                          id="db-import"
                          accept=".zip"
                          onChange={handleImportDatabase}
                          disabled={importing}
                          className={styles.fileInput}
                        />
                        <Button
                          onClick={() => document.getElementById("db-import")?.click()}
                          disabled={importing}
                          className={styles.importButton}
                        >
                          {importing ? "Импорт..." : "📥 Импорт БД"}
                        </Button>
                      </div>
                    </div>
                    <p className={styles.importWarning}>
                      ⚠️ Внимание: Импорт базы данных заменит все текущие данные. Рекомендуется
                      создать резервную копию перед импортом.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      <div className={styles.actions}>
        <Button onClick={handleSave} disabled={saving} className={styles.saveButton}>
          {saving ? "Сохранение..." : "Сохранить настройки"}
        </Button>
        <Button onClick={() => router.push("/admin")} className={styles.cancelButton}>
          Вернуться к дашборду
        </Button>
      </div>
    </div>
  );
}

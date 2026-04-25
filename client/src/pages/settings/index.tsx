'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { fetchSettings, updateMultipleSettings } from '@/src/shared/api/settings';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import styles from './settings.module.css';

export default function SettingsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [settingsGroups, setSettingsGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const groups = await import('@/src/shared/api/settings').then(m => m.settingsApi.getSettingsGroups());
      const allSettings = await fetchSettings(accessToken);
      
      // Создаем объект с текущими значениями
      const initialData: Record<string, string> = {};
      allSettings.forEach(setting => {
        initialData[setting.key] = setting.value;
      });
      
      setFormData(initialData);
      setSettingsGroups(groups);
    } catch (error) {
      showToast('Ошибка при загрузке настроек', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
        key,
        value
      }));
      
      await updateMultipleSettings(accessToken, settingsToUpdate);
      showToast('Настройки сохранены', 'success');
    } catch (error) {
      showToast('Ошибка при сохранении настроек', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (setting: any) => {
    const value = formData[setting.key] || setting.defaultValue;
    
    switch (setting.type) {
      case 'boolean':
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
      case 'number':
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
      case 'json':
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
        return (
          <Input
            type={setting.key.includes('password') ? 'password' : setting.key.includes('url') ? 'url' : 'text'}
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
        <div className={styles.spinner}></div>
        <p>Загрузка настроек...</p>
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
            className={`${styles.tab} ${activeTab === group.category ? styles.active : ''}`}
          >
            {group.title}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {settingsGroups
          .filter(group => group.category === activeTab)
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
              </div>
            </div>
          ))}
      </div>

      <div className={styles.actions}>
        <Button
          onClick={handleSave}
          disabled={saving}
          className={styles.saveButton}
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
        <Button
          onClick={() => router.push('/admin')}
          className={styles.cancelButton}
        >
          Вернуться к дашборду
        </Button>
      </div>
    </div>
  );
}

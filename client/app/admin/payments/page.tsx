'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { fetchPaymentGateways, fetchPaymentMethods, createPaymentGateway, updatePaymentGateway, deletePaymentGateway, togglePaymentGateway } from '@/src/shared/api/payments';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import { Pagination, Modal, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/src/shared/ui';
import styles from './payments.module.css';

export default function PaymentsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [gateways, setGateways] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'gateways' | 'methods'>('gateways');
  const [showModal, setShowModal] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    isEnabled: false,
    settings: '',
    displayOrder: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [gatewaysData, methodsData] = await Promise.all([
        fetchPaymentGateways(accessToken),
        fetchPaymentMethods(accessToken)
      ]);
      setGateways(gatewaysData);
      setMethods(methodsData);
    } catch (error) {
      showToast('Ошибка при загрузке платежных данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGateway = () => {
    setEditingGateway(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      isEnabled: false,
      settings: '',
      displayOrder: 0
    });
    setShowModal(true);
  };

  const handleEditGateway = (gateway: any) => {
    setEditingGateway(gateway);
    setForm({
      name: gateway.name,
      slug: gateway.slug,
      description: gateway.description || '',
      isEnabled: gateway.isEnabled,
      settings: JSON.stringify(gateway.settings || {}, null, 2),
      displayOrder: gateway.displayOrder
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const gatewayData = {
        ...form,
        settings: form.settings ? JSON.parse(form.settings) : {}
      };

      if (editingGateway) {
        await updatePaymentGateway(accessToken, editingGateway.id, gatewayData);
        showToast('Платежный шлюз обновлен', 'success');
      } else {
        await createPaymentGateway(accessToken, gatewayData);
        showToast('Платежный шлюз создан', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      showToast('Ошибка при сохранении платежного шлюза', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены что хотите удалить этот платежный шлюз?')) {
      try {
        await deletePaymentGateway(accessToken, id);
        showToast('Платежный шлюз удален', 'success');
        loadData();
      } catch (error) {
        showToast('Ошибка при удалении платежного шлюза', 'error');
      }
    }
  };

  const handleToggle = async (id: number, isEnabled: boolean) => {
    try {
      await togglePaymentGateway(accessToken, id, isEnabled);
      showToast(`Платежный шлюз ${isEnabled ? 'включен' : 'выключен'}`, 'success');
      loadData();
    } catch (error) {
      showToast('Ошибка при изменении статуса', 'error');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'card': return '💳';
      case 'bank': return '🏦';
      case 'crypto': return '₿';
      default: return '💰';
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Платежная система</h1>
        <p>Управление платежными шлюзами и методами оплаты</p>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('gateways')}
          className={`${styles.tab} ${activeTab === 'gateways' ? styles.active : ''}`}
        >
          Платежные шлюзы
        </button>
        <button
          onClick={() => setActiveTab('methods')}
          className={`${styles.tab} ${activeTab === 'methods' ? styles.active : ''}`}
        >
          Платежные методы
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <>
          {activeTab === 'gateways' && (
            <div className={styles.content}>
              <div className={styles.toolbar}>
                <Button onClick={handleCreateGateway} className={styles.createButton}>
                  ➕ Создать шлюз
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Порядок</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gateways.map((gateway) => (
                    <TableRow key={gateway.id}>
                      <TableCell>
                        <div className={styles.gatewayInfo}>
                          <div className={styles.gatewayName}>{gateway.name}</div>
                          {gateway.description && (
                            <div className={styles.gatewayDescription}>{gateway.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{gateway.slug}</TableCell>
                      <TableCell>
                        <span className={`${styles.status} ${gateway.isEnabled ? styles.enabled : styles.disabled}`}>
                          {gateway.isEnabled ? 'Активен' : 'Неактивен'}
                        </span>
                      </TableCell>
                      <TableCell>{gateway.displayOrder}</TableCell>
                      <TableCell>
                        <div className={styles.actions}>
                          <Button
                            onClick={() => handleEditGateway(gateway)}
                            className={styles.editButton}
                          >
                            ✏️
                          </Button>
                          <Button
                            onClick={() => handleToggle(gateway.id, !gateway.isEnabled)}
                            className={`${styles.toggleButton} ${gateway.isEnabled ? styles.disable : styles.enable}`}
                          >
                            {gateway.isEnabled ? '🔴' : '🟢'}
                          </Button>
                          <Button
                            onClick={() => handleDelete(gateway.id)}
                            className={styles.deleteButton}
                          >
                            🗑️
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'methods' && (
            <div className={styles.content}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Шлюз</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell>
                        <div className={styles.methodInfo}>
                          <span className={styles.methodIcon}>{getTypeIcon(method.type)}</span>
                          <div>
                            <div className={styles.methodName}>{method.name}</div>
                            {method.description && (
                              <div className={styles.methodDescription}>{method.description}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{method.slug}</TableCell>
                      <TableCell>
                        <span className={styles.type}>{method.type}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`${styles.status} ${method.isEnabled ? styles.enabled : styles.disabled}`}>
                          {method.isEnabled ? 'Активен' : 'Неактивен'}
                        </span>
                      </TableCell>
                      <TableCell>{method.paymentGatewayId || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingGateway ? 'Редактировать шлюз' : 'Создать шлюз'}
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Название</label>
            <Input
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите название шлюза"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="payment-gateway-slug"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Описание платежного шлюза"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Порядок отображения</label>
            <Input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
              placeholder="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Настройки (JSON)</label>
            <textarea
              value={form.settings}
              onChange={(e) => setForm(prev => ({ ...prev, settings: e.target.value }))}
              placeholder='{"apiKey": "...", "secretKey": "..."}'
              className={styles.textarea}
              rows={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.isEnabled}
                onChange={(e) => setForm(prev => ({ ...prev, isEnabled: e.target.checked }))}
              />
              Активен
            </label>
          </div>

          <div className={styles.modalActions}>
            <Button onClick={handleSave} className={styles.saveButton}>
              {editingGateway ? 'Сохранить' : 'Создать'}
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              className={styles.cancelButton}
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

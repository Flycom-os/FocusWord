'use client';

/**
 * @page Sliders (Records)
 */

import { useEffect, useMemo, useState } from "react";
import styles from "@/src/pages/records/index.module.css";
import { Notifications, Pagination, PermissionGate, UiButton, Modal } from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";
import {
  createSlider,
  deleteSlider,
  fetchSliders,
  PaginatedSlidersResponse,
  SliderDto,
  SliderQuery,
} from "@/src/shared/api/sliders";
import { useAuth } from "@/src/app/providers/auth-provider";

const defaultQuery: SliderQuery = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const RecordsPage = () => {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState<SliderQuery>(defaultQuery);
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const totalPages = useMemo(() => {
    if (!query.limit) return 1;
    return Math.max(1, Math.ceil(total / query.limit));
  }, [total, query.limit]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res: PaginatedSlidersResponse = await fetchSliders(accessToken, query);
        setSliders(res.data);
        setTotal(res.total);
      } catch {
        // ошибки показываются через Notifications при необходимости
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [accessToken, query]);

  const handleCreate = async () => {
    try {
      await createSlider(accessToken, { name, slug, description });
      setIsCreateOpen(false);
      setName("");
      setSlug("");
      setDescription("");
      setQuery((prev) => ({ ...prev }));
    } catch {
      // обработка ошибок
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSlider(accessToken, id);
      setQuery((prev) => ({ ...prev }));
    } catch {
      // обработка ошибок
    }
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleSearchChange = (value: string) => {
    setQuery((prev) => ({ ...prev, page: 1, search: value }));
  };

  return (
    <div className={styles.root}>
      <Notifications />
      <div className={styles.toolbar}>
        <Input
          className={styles.search}
          theme="secondary"
          icon="left"
          placeholder="Поиск по названию"
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <PermissionGate resource="sliders" level={2}>
          <UiButton theme="primary" onClick={() => setIsCreateOpen(true)}>
            Новый слайдер
          </UiButton>
        </PermissionGate>
      </div>

      <div className={styles.table}>
        <div className={styles.headerRow}>
          <div>Название</div>
          <div>Slug</div>
          <div>Описание</div>
          <div className={styles.actionsCol}>Действия</div>
        </div>
        {sliders.map((slider) => (
          <div key={slider.id} className={styles.row}>
            <div>{slider.name}</div>
            <div>{slider.slug}</div>
            <div className={styles.description}>{slider.description}</div>
            <div className={styles.actionsCol}>
              {/* Здесь позже можно добавить переход к редактированию слайдов */}
              <PermissionGate resource="sliders" level={2}>
                <UiButton theme="warning" onClick={() => handleDelete(slider.id)}>
                  Удалить
                </UiButton>
              </PermissionGate>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Pagination currentPage={query.page || 1} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      <PermissionGate resource="sliders" level={2}>
        <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
          <div className={styles.modalContent}>
            <h2>Новый слайдер</h2>
            <Input
              className={styles.input}
              placeholder="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              className={styles.input}
              placeholder="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <Input
              className={styles.input}
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <UiButton theme="primary" onClick={handleCreate} disabled={!name || !slug}>
              Создать
            </UiButton>
          </div>
        </Modal>
      </PermissionGate>
    </div>
  );
};

export default RecordsPage;

/**
 * @page Records
 */

const RecordsPage = () => {
  return <div className="app light">hi</div>;
};

export default RecordsPage;

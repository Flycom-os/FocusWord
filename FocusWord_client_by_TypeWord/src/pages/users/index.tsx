/**
 * @page Users
 */
'use client'
import UiPageHeader from "@/src/shared/ui/Header/ui-page-header";
import Button from "@/src/shared/ui/Button/ui-button";
import Input from "@/src/shared/ui/Input/ui-input";
import Modal from "@/src/shared/ui/Modal/ui-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/shared/ui/Table/ui-table";
import styles from "./index.module.css";
import { useState } from "react";

type Filter = "all" | "blocked" | "me";
type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  blocked?: boolean;
  createdAt: string;
};

const UsersPage = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Хардкод данные для каждого раздела
  const usersAll: User[] = [
    { id: "1", name: "Иван Иванов", email: "ivan@example.com", role: "Админ", createdAt: "23.06.2023" },
    { id: "2", name: "Мария Петрова", email: "maria@example.com", role: "Пользователь", createdAt: "23.06.2023" },
    { id: "3", name: "Петр Сидоров", email: "petr@example.com", role: "Редактор", createdAt: "12.04.2023" },
  ];
  const usersBlocked: User[] = [
    { id: "4", name: "Анна Смирнова", email: "anna@example.com", role: "Пользователь", blocked: true, createdAt: "01.02.2023" },
  ];
  const usersMe: User[] = [
    { id: "5", name: "Мой Аккаунт", email: "me@example.com", role: "Админ", createdAt: "10.01.2022" },
  ];

  const users: User[] = filter === "all" ? usersAll : filter === "blocked" ? usersBlocked : usersMe;

  const openEdit = (user: User) => {
    setEditUser(user);
    setIsModalOpen(true);
  };
  const closeEdit = () => {
    setIsModalOpen(false);
    setEditUser(null);
  };

  return (
    <div className="app light">
      <UiPageHeader title="Пользователи" subTitle="Админ / Пользователи" />

      <div className={styles.page}>
        <div className={styles.filters}>
          <Button
            className={`${styles.filterBtn} ${filter === "all" ? styles.filterBtnActive : ""}`}
            theme="secondary"
            onClick={() => setFilter("all")}
          >
            Все пользователи
          </Button>
          <Button
            className={`${styles.filterBtn} ${filter === "blocked" ? styles.filterBtnActive : ""}`}
            theme="secondary"
            onClick={() => setFilter("blocked")}
          >
            Заблокированные
          </Button>
          <Button
            className={`${styles.filterBtn} ${filter === "me" ? styles.filterBtnActive : ""}`}
            theme="secondary"
            onClick={() => setFilter("me")}
          >
            Только мой аккаунт
          </Button>
        </div>

        <div className={styles.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Роль</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} onClick={() => openEdit(u)} style={{ cursor: "pointer" }}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.blocked ? "Заблокирован" : "Активен"}</TableCell>
                  <TableCell>{u.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeEdit} title="Редактирование пользователя">
        {editUser && (
          <form className={styles.modalForm} onSubmit={(e) => e.preventDefault()}>
            <div>
              <div className={styles.fieldLabel}>Имя</div>
              <Input defaultValue={editUser.name} readOnly theme="secondary" />
            </div>
            <div>
              <div className={styles.fieldLabel}>Почта</div>
              <Input defaultValue={editUser.email} readOnly theme="secondary" />
            </div>
            <div>
              <div className={styles.fieldLabel}>Роль</div>
              <Input defaultValue={editUser.role} readOnly theme="secondary" />
            </div>
            <div>
              <div className={styles.fieldLabel}>Дата регистрации</div>
              <div>{editUser.createdAt}</div>
            </div>

            <div className={styles.footer}>
              <div className={styles.footerLeft}>
                <Button theme="warning">Удалить</Button>
                <Button theme="warning">Заблокировать</Button>
              </div>
              <div className={styles.footerRight}>
                <Button theme="secondary" onClick={closeEdit}>Отменить</Button>
                <Button type="submit">Сохранить</Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UsersPage;

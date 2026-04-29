'use client';

/**
 * @page Users
 */

import { useEffect, useState } from "react";
import BlockManagement from "@/src/widgets/block_management";
import styles from "@/src/pages/users/index.module.css";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  UserDto,
  UsersQuery,
} from "@/src/shared/api/users";
import { fetchRoles, RoleDto } from "@/src/shared/api/roles";
import {
  Pagination,
  PermissionGate,
  UiButton,
  Modal,
  Notifications,
  showToast,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Select,
  SelectableTableRow,
  SelectableTableHead,
} from "@/src/shared/ui";
import { useTableSelection } from "@/src/shared/hooks/useTableSelection";
import Input from "@/src/shared/ui/Input/ui-input";

const defaultQuery: UsersQuery = {
  page: 1,
  limit: 20,
};

const UsersPage = () => {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState<UsersQuery>(defaultQuery);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);

  // Table selection hook
  const tableSelection = useTableSelection({
    items: users,
    getItemId: (user) => user.id,
    onSelectionChange: (selectedIds) => {
      console.log('Selected users:', selectedIds);
    },
  });

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [usersRes, rolesRes] = await Promise.all([
          fetchUsers(accessToken, query),
          fetchRoles(accessToken, {}),
        ]);
        setUsers(usersRes);
        setUsersTotal(usersRes.length);
        setRoles(rolesRes);
      } catch (error: any) {
        const message = error?.response?.data?.message || "Не удалось загрузить пользователей";
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [accessToken, query]);

  const handleSearchChange = (value: string) => {
    setQuery((prev) => ({ ...prev, page: 1, name: value }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleCreate = () => {
    setEditingUser(null);
    setEmail("");
    setPassword("");
    setUsername("");
    setFirstName("");
    setLastName("");
    setRoleId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserDto) => {
    setEditingUser(user);
    setEmail(user.email);
    setPassword("");
    setUsername(user.username || "");
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setRoleId(user.roleId);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!email || (!editingUser && !password)) {
      showToast("Заполните обязательные поля", "error");
      return;
    }
    try {
      if (editingUser) {
        await updateUser(accessToken, editingUser.id, {
          email,
          username: username || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          roleId: roleId || undefined,
        });
        showToast("Пользователь обновлен", "success");
      } else {
        // Для создания используем roleName вместо roleId, так как бекенд принимает roleName
        const selectedRole = roles.find((r) => r.id === roleId);
        await createUser(accessToken, {
          email,
          password,
          username: username || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          roleName: selectedRole?.name || undefined,
        });
        showToast("Пользователь создан", "success");
      }
      setIsModalOpen(false);
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось сохранить пользователя";
      showToast(message, "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;
    try {
      await deleteUser(accessToken, id);
      showToast("Пользователь удален", "success");
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось удалить пользователя";
      showToast(message, "error");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className={styles.root}>
      <Notifications />
      <BlockManagement type={"third"} />

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Input
            className={styles.search}
            theme="secondary"
            icon="left"
            placeholder="Поиск пользователей..."
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <PermissionGate resource="users" level={2}>
          <UiButton theme="primary" onClick={handleCreate}>
            Добавить пользователя
          </UiButton>
        </PermissionGate>
      </div>

      <Table className={styles.table} ref={tableSelection.tableRef}>
        <TableHeader>
          <TableRow>
            <SelectableTableHead
              selectable={true}
              onSelectAll={tableSelection.selectAll}
              isAllSelected={tableSelection.isAllSelected()}
              isPartiallySelected={tableSelection.isPartiallySelected()}
            />
            <TableHead>Email</TableHead>
            <TableHead>Имя</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead className={styles.actionsColumn}>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <SelectableTableRow
              key={user.id}
              selected={tableSelection.isSelected(user.id)}
              focused={tableSelection.focusedIndex === index}
              onSelect={(e) => tableSelection.handleRowClick(user.id, e)}
              checkboxColumn={true}
            >
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.firstName || user.lastName
                  ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                  : user.username || '-'}
              </TableCell>
              <TableCell>{user.role?.name || '-'}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell className={styles.actionsColumn}>
                <PermissionGate resource="users" level={1}>
                  <UiButton theme="secondary" onClick={() => handleEdit(user)}>
                    Редактировать
                  </UiButton>
                </PermissionGate>
                <PermissionGate resource="users" level={2}>
                  <UiButton theme="warning" onClick={() => handleDelete(user.id)}>
                    Удалить
                  </UiButton>
                </PermissionGate>
              </TableCell>
            </SelectableTableRow>
          ))}
        </TableBody>
      </Table>

      <div className={styles.footer}>
        <Pagination
          page={query.page || 1}
          total={usersTotal}
          perPage={query.limit || 20}
          onChange={handlePageChange}
        />
      </div>

      <PermissionGate resource="users" level={2}>
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingUser ? "Редактировать пользователя" : "Создать пользователя"}
        >
          <div className={styles.modalContent}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Email *</label>
              <Input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            {!editingUser && (
              <div className={styles.formField}>
                <label className={styles.formLabel}>Пароль *</label>
                <Input
                  className={styles.input}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                />
              </div>
            )}
            <div className={styles.formField}>
              <label className={styles.formLabel}>Имя пользователя</label>
              <Input
                className={styles.input}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Имя пользователя"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Имя</label>
              <Input
                className={styles.input}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Имя"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Фамилия</label>
              <Input
                className={styles.input}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Фамилия"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Роль</label>
              <Select
                className={styles.input}
                options={[
                  { value: '', label: 'Без роли' },
                  ...roles.map((role) => ({ value: role.id.toString(), label: role.name })),
                ]}
                value={roleId?.toString() || ''}
                onChange={(value) => setRoleId(value ? parseInt(value) : null)}
              />
            </div>
            <div className={styles.modalFooter}>
              <UiButton theme="secondary" onClick={() => setIsModalOpen(false)}>
                Отмена
              </UiButton>
              <UiButton theme="primary" onClick={handleSave}>
                Сохранить
              </UiButton>
            </div>
          </div>
        </Modal>
      </PermissionGate>
    </div>
  );
};

export default UsersPage;

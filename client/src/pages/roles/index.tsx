"use client";

/**
 * @page Roles
 */

import { useEffect, useState } from "react";
import BlockManagement from "@/src/widgets/block_management";
import styles from "@/src/pages/roles/index.module.css";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  RoleDto,
  RolesQuery,
} from "@/src/shared/api/roles";
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
} from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";

const defaultQuery: RolesQuery = {
  page: 1,
  limit: 20,
};

const RolesPage = () => {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState<RolesQuery>(defaultQuery);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [rolesTotal, setRolesTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permissionInput, setPermissionInput] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetchRoles(accessToken, query);
        setRoles(res);
        setRolesTotal(res.length);
      } catch (error: any) {
        const message = error?.response?.data?.message || "Failed to load roles";
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [accessToken, query]);

  const handleSearchChange = (value: string) => {
    setQuery((prev) => ({ ...prev, page: 1, search: value }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleCreate = () => {
    setEditingRole(null);
    setName("");
    setDescription("");
    setPermissions([]);
    setPermissionInput("");
    setIsModalOpen(true);
  };

  const handleEdit = (role: RoleDto) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || "");
    setPermissions(role.permissions || []);
    setPermissionInput("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name) {
      showToast("Please fill in the required fields", "error");
      return;
    }
    try {
      if (editingRole) {
        await updateRole(accessToken, editingRole.id, {
          name,
          description: description || undefined,
          permissions,
        });
        showToast("Role updated", "success");
      } else {
        await createRole(accessToken, {
          name,
          description: description || undefined,
          permissions,
        });
        showToast("Role created", "success");
      }
      setIsModalOpen(false);
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to save role";
      showToast(message, "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRole(accessToken, id);
      showToast("Role deleted", "success");
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete role";
      showToast(message, "error");
    }
  };

  const handleAddPermission = () => {
    if (permissionInput.trim()) {
      setPermissions((prev) => [...prev, permissionInput.trim()]);
      setPermissionInput("");
    }
  };

  const handleRemovePermission = (index: number) => {
    setPermissions((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  return (
    <div className={styles.root}>
      <Notifications />
      <BlockManagement type="third" />

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Input
            className={styles.search}
            theme="secondary"
            icon="left"
            placeholder="Search roles..."
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <PermissionGate resource="roles" level={2}>
          <UiButton theme="primary" onClick={handleCreate}>
            Add Role
          </UiButton>
        </PermissionGate>
      </div>

      <Table className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className={styles.actionsColumn}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.description || "-"}</TableCell>
              <TableCell>
                <div className={styles.permissionsList}>
                  {role.permissions.length > 0
                    ? role.permissions.slice(0, 3).map((perm, idx) => (
                        <span key={idx} className={styles.permissionTag}>
                          {perm}
                        </span>
                      ))
                    : "-"}
                  {role.permissions.length > 3 && (
                    <span className={styles.morePermissions}>+{role.permissions.length - 3}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(role.createdAt)}</TableCell>
              <TableCell className={styles.actionsColumn}>
                <PermissionGate resource="roles" level={1}>
                  <UiButton theme="secondary" onClick={() => handleEdit(role)}>
                    Edit
                  </UiButton>
                </PermissionGate>
                <PermissionGate resource="roles" level={2}>
                  <UiButton theme="warning" onClick={() => handleDelete(role.id)}>
                    Delete
                  </UiButton>
                </PermissionGate>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className={styles.footer}>
        <Pagination
          page={query.page || 1}
          total={rolesTotal}
          perPage={query.limit || 20}
          onChange={handlePageChange}
        />
      </div>

      <PermissionGate resource="roles" level={2}>
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRole ? "Edit Role" : "Create Role"}
        >
          <div className={styles.modalContent}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Name *</label>
              <Input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Role Name"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Description</label>
              <Input
                className={styles.input}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Role Description"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Permissions</label>
              <div className={styles.permissionsInput}>
                <Input
                  className={styles.input}
                  value={permissionInput}
                  onChange={(e) => setPermissionInput(e.target.value)}
                  placeholder="e.g., users:2, pages:1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPermission();
                    }
                  }}
                />
                <UiButton theme="secondary" onClick={handleAddPermission}>
                  Add
                </UiButton>
              </div>
              <div className={styles.permissionsList}>
                {permissions.map((perm, index) => (
                  <span key={index} className={styles.permissionTag}>
                    {perm}
                    <button
                      className={styles.removePermission}
                      onClick={() => handleRemovePermission(index)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <UiButton theme="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </UiButton>
              <UiButton theme="primary" onClick={handleSave}>
                Save
              </UiButton>
            </div>
          </div>
        </Modal>
      </PermissionGate>
    </div>
  );
};

export default RolesPage;

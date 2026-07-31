"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/shared/ui/Input/ui-input";
import { fetchTags, createTag, updateTag, deleteTag } from "@/src/shared/api/tags";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  Pagination,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  UiButton,
} from "@/src/shared/ui";
import styles from "./tags.module.css";

export default function TagsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    loadTags();
  }, [pagination.page, search]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await fetchTags(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      setTags(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
      showToast("Error loading tags", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTag(null);
    setForm({
      name: "",
      slug: "",
      description: "",
    });
    setShowModal(true);
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setForm({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingTag) {
        await updateTag(accessToken, editingTag.id, form);
        showToast("Tag updated", "success");
      } else {
        await createTag(accessToken, form);
        showToast("Tag created", "success");
      }
      setShowModal(false);
      loadTags();
    } catch (error) {
      showToast("Error saving tag", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      try {
        await deleteTag(accessToken, id);
        showToast("Tag deleted", "success");
        loadTags();
      } catch (error) {
        showToast("Error deleting tag", "error");
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1> Tags </h1>
        <p>Manage tags for posts</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <UiButton theme="primary" onClick={handleCreate} className={styles.createButton}>
          ➕ Create Tag
        </UiButton>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}> Loading... </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead> Name </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead> Description </TableHead>
                <TableHead> Actions </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>{tag.slug}</TableCell>
                  <TableCell>{tag.description || "-"}</TableCell>
                  <TableCell>
                    <div className={styles.actions}>
                      <UiButton theme="secondary" onClick={() => handleEdit(tag)} className={styles.editButton}>
                        ✏️ Edit
                      </UiButton>
                      <UiButton theme="warning" onClick={() => handleDelete(tag.id)} className={styles.deleteButton}>
                        🗑️ Delete
                      </UiButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination.total > pagination.limit && (
        <div className={styles.pagination}>
          <Pagination
            page={pagination.page}
            total={pagination.total}
            perPage={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingTag ? "Edit Tag" : "Create Tag"}
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label> Name </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter tag name"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="url-slug"
            />
          </div>

          <div className={styles.formGroup}>
            <label> Description </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Tag description"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.modalActions}>
            <UiButton theme="primary" onClick={handleSave} className={styles.saveButton}>
              {editingTag ? "Save" : "Create"}
            </UiButton>
            <UiButton theme="secondary" onClick={() => setShowModal(false)} className={styles.cancelButton}> Cancel </UiButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}

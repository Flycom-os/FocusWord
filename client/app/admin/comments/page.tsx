"use client";

import { Edit3, Check, X, Trash2 } from "lucide-react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/shared/ui/Input/ui-input";
import Button from "@/src/shared/ui/Button/ui-button";
import {
  fetchComments,
  updateComment,
  deleteComment,
  changeCommentStatus,
} from "@/src/shared/api/comments";
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
} from "@/src/shared/ui";
import styles from "./comments.module.css";

export default function CommentsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "all",
  );
  const [showModal, setShowModal] = useState(false);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [form, setForm] = useState({
    content: "",
    status: "pending" as "pending" | "approved" | "rejected",
  });

  useEffect(() => {
    loadComments();
  }, [pagination.page, search, statusFilter]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetchComments(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setComments(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
      showToast("Error loading comments", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comment: any) => {
    setEditingComment(comment);
    setForm({
      content: comment.content,
      status: comment.status,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await updateComment(accessToken, editingComment.id, form);
      showToast("Comment updated", "success");
      setShowModal(false);
      loadComments();
    } catch (error) {
      showToast("Error saving comment", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment(accessToken, id);
        showToast("Comment deleted", "success");
        loadComments();
      } catch (error) {
        showToast("Error deleting comment", "error");
      }
    }
  };

  const handleStatusChange = async (id: number, status: "pending" | "approved" | "rejected") => {
    try {
      await changeCommentStatus(accessToken, id, status);
      showToast("Status changed", "success");
      loadComments();
    } catch (error) {
      showToast("Error changing status", "error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return styles.approved;
      case "rejected":
        return styles.rejected;
      case "pending":
        return styles.pending;
      default:
        return styles.pending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Comments</h1>
        <p>Manage user comments</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            placeholder="Search comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={styles.select}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className={styles.author}>
                      {comment.authorName || "Anonymous"}
                      {comment.authorEmail && (
                        <div className={styles.email}>{comment.authorEmail}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={styles.commentContent}>{truncateText(comment.content)}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`${styles.status} ${getStatusColor(comment.status)}`}>
                      {getStatusText(comment.status)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className={styles.actions}>
                      <Button
                        onClick={() => handleEdit(comment)}
                        className={styles.editButton}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Edit3 size={16} />
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(comment.id, "approved")}
                        className={styles.approveButton}
                        title="Approve"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(comment.id, "rejected")}
                        className={styles.rejectButton}
                        title="Reject"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <X size={16} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(comment.id)}
                        className={styles.deleteButton}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Edit comment">
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Comment text"
              className={styles.textarea}
              rows={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as any }))}
              className={styles.select}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <Button onClick={handleSave} className={styles.saveButton}>
              Save
            </Button>
            <Button onClick={() => setShowModal(false)} className={styles.cancelButton}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

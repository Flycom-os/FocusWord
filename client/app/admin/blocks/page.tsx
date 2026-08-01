"use client";

import { Edit3, Copy, Trash2 } from "lucide-react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchBlocks, createBlock, updateBlock, deleteBlock } from "@/src/shared/api/blocks";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  Pagination,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/src/shared/ui";
import styles from "./blocks.module.css";

export default function BlocksPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [pagination.page, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchBlocks(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        search,
      });
      setBlocks(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
      showToast("Error loading blocks", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this block?")) {
      try {
        await deleteBlock(accessToken, id);
        showToast("Block deleted", "success");
        loadData();
      } catch (error) {
        showToast("Error deleting block", "error");
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "text":
        return "📝";
      case "image":
        return "🖼️";
      case "video":
        return "🎥";
      case "slider":
        return "🎠";
      case "form":
        return "📋";
      default:
        return "📦";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Content Blocks</h1>
        <p>Reusable components</p>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Search blocks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks.map((block) => (
              <TableRow key={block.id}>
                <TableCell>
                  <div className={styles.blockInfo}>
                    <div className={styles.blockName}>{block.name}</div>
                    {block.description && (
                      <div className={styles.blockDescription}>{block.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={styles.type}>
                    <span className={styles.typeIcon}>{getTypeIcon(block.type)}</span>
                    {block.type}
                  </div>
                </TableCell>
                <TableCell>{block.slug}</TableCell>
                <TableCell>
                  <span
                    className={`${styles.status} ${block.isActive ? styles.active : styles.inactive}`}
                  >
                    {block.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>{new Date(block.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className={styles.cloneButton}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(block.id)}
                      className={styles.deleteButton}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
    </div>
  );
}

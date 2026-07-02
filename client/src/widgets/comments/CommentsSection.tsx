"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/app/providers/auth-provider";
import { commentsApi, CommentDto } from "@/src/shared/api/comments";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";

interface CommentsSectionProps {
  postId?: number;
  blogPostId?: number;
  articleId?: number;
}

export const CommentsSection = ({ postId, blogPostId, articleId }: CommentsSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [submittedMessage, setSubmittedMessage] = useState("");

  useEffect(() => {
    loadComments();
  }, [postId, blogPostId, articleId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentsApi.getAll(null, {
        postId,
        blogPostId,
        articleId,
        status: "approved", // Public users only see approved comments
        limit: 100,
      });
      setComments(response.data || []);
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user && (!authorName.trim() || !authorEmail.trim())) {
      showToast("Пожалуйста, заполните имя и email", "error");
      return;
    }

    try {
      setSubmitting(true);
      await commentsApi.create({
        content,
        authorName: user ? user.username || "Пользователь" : authorName,
        authorEmail: user ? user.email : authorEmail,
        postId,
        blogPostId,
        articleId,
      });

      setContent("");
      if (!user) {
        setAuthorName("");
        setAuthorEmail("");
      }

      setSubmittedMessage("Ваш комментарий отправлен и появится после проверки модератором.");
      showToast("Комментарий отправлен на модерацию", "success");

      // Auto-clear message after 5 seconds
      setTimeout(() => setSubmittedMessage(""), 7000);

      // Reload comments in case some auto-approval is active, or just to keep state clean
      loadComments();
    } catch (error) {
      showToast("Не удалось отправить комментарий", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-100 pt-8 max-w-3xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        💬 Комментарии ({comments.length})
      </h3>

      {/* List of comments */}
      {loading ? (
        <div className="flex justify-center py-6 text-gray-500">Загрузка комментариев...</div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 italic mb-8">Комментариев пока нет. Будьте первым!</p>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800 text-sm">
                  {comment.authorName || (comment.author && comment.author.username) || "Аноним"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-line">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Submit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4"
      >
        <h4 className="font-semibold text-gray-800 text-base">Оставить комментарий</h4>

        {submittedMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-100">
            ✅ {submittedMessage}
          </div>
        )}

        {!user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ваше Имя</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Иван Иванов"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Email (не публикуется)
              </label>
              <input
                type="email"
                required
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="email@example.com"
              />
            </div>
          </div>
        )}

        {user && (
          <div className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg w-max">
            👤 Вы авторизованы как{" "}
            <span className="font-semibold text-gray-700">{user.username || user.email}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Текст комментария</label>
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            placeholder="Напишите здесь ваше мнение..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
        >
          {submitting ? "Отправка..." : "Отправить комментарий"}
        </button>
      </form>
    </div>
  );
};

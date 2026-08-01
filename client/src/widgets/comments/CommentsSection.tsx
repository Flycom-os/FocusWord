"use client";

import { useState, useEffect, useCallback } from "react";
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

  const loadComments = useCallback(async () => {
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
      // eslint-disable-next-line no-console
      console.error("Failed to load comments", error);
    } finally {
      setLoading(false);
    }
  }, [postId, blogPostId, articleId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!user && (!authorName.trim() || !authorEmail.trim())) {
      showToast("Please fill in your name and email", "error");
      return;
    }

    try {
      setSubmitting(true);
      await commentsApi.create({
        content,
        authorName: user ? user.username || "User" : authorName,
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

      setSubmittedMessage(
        "Your comment has been submitted and will appear after moderation check.",
      );
      showToast("Comment submitted for moderation", "success");

      // Auto-clear message after 5 seconds
      setTimeout(() => setSubmittedMessage(""), 7000);

      // Reload comments in case some auto-approval is active, or just to keep state clean
      loadComments();
    } catch {
      showToast("Failed to submit comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-100 pt-8 max-w-3xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        💬 Comments ({comments.length})
      </h3>

      {/* List of comments */}
      {loading && <div className="flex justify-center py-6 text-gray-500">Loading comments...</div>}

      {!loading && comments.length === 0 && (
        <p className="text-gray-500 italic mb-8">No comments yet. Be the first to comment!</p>
      )}

      {!loading && comments.length > 0 && (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all hover:shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-800 text-sm">
                  {comment.authorName || (comment.author && comment.author.username) || "Anonymous"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
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
        <h4 className="font-semibold text-gray-800 text-base">Leave a comment</h4>

        {submittedMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-100">
            ✅ {submittedMessage}
          </div>
        )}

        {!user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="author-name" className="block text-xs font-medium text-gray-500 mb-1">
                Your Name
              </label>
              <input
                id="author-name"
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label
                htmlFor="author-email"
                className="block text-xs font-medium text-gray-500 mb-1"
              >
                Email (not published)
              </label>
              <input
                id="author-email"
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
            👤 You are logged in as{" "}
            <span className="font-semibold text-gray-700">{user.username || user.email}</span>
          </div>
        )}

        <div>
          <label htmlFor="comment-content" className="block text-xs font-medium text-gray-500 mb-1">
            Comment Text
          </label>
          <textarea
            id="comment-content"
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            placeholder="Write your comment here..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Comment"}
        </button>
      </form>
    </div>
  );
};

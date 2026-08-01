"use client";

import React, { useState } from "react";
import { createFeedback } from "@/src/shared/api/feedback";
import styles from "./FeedbackForm.module.css";

interface FeedbackFormProps {
  className?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ className = "" }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      setErrorMessage("Пожалуйста, заполните все обязательные поля");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      await createFeedback({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        rating,
      });
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setRating(5);
    } catch (error: any) {
      console.error("Feedback submit error:", error);
      setStatus("error");
      setErrorMessage(
        error?.response?.data?.message ||
          "Произошла ошибка при отправке отзыва. Пожалуйста, попробуйте позже.",
      );
    }
  };

  return (
    <section className={`${styles.feedbackSection} ${className}`}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>Обратная связь</span>
          <h2 className={styles.title}>Оставьте ваш отзыв</h2>
          <p className={styles.subtitle}>
            Поделитесь вашим мнением о материале. Мы ценим каждый отзыв!
          </p>
        </div>

        {status === "success" ? (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.successTitle}>Спасибо за ваш отзыв!</h3>
            <p className={styles.successText}>
              Ваш отзыв успешно отправлен и будет опубликован после модерации.
            </p>
            <button onClick={() => setStatus("idle")} className={styles.resetButton}>
              Отправить еще один
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {status === "error" && <div className={styles.errorAlert}>{errorMessage}</div>}

            <div className={styles.ratingGroup}>
              <span className={styles.ratingLabel}>Ваша оценка:</span>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.starButton} ${
                      star <= (hoverRating ?? rating) ? styles.activeStar : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="feedback-name" className={styles.fieldLabel}>
                  Ваше имя <span className={styles.required}>*</span>
                </label>
                <input
                  id="feedback-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  disabled={status === "submitting"}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="feedback-email" className={styles.fieldLabel}>
                  Ваш Email <span className={styles.required}>*</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  disabled={status === "submitting"}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="feedback-message" className={styles.fieldLabel}>
                Сообщение / Отзыв <span className={styles.required}>*</span>
              </label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Что вам понравилось или что можно улучшить?"
                disabled={status === "submitting"}
                className={styles.textarea}
                rows={4}
                required
              />
            </div>

            <button type="submit" disabled={status === "submitting"} className={styles.submitBtn}>
              {status === "submitting" ? "Отправка..." : "Отправить отзыв"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

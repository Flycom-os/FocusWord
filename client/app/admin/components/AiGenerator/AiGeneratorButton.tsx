"use client";

import React, { useState } from "react";
import styles from "./AiGenerator.module.css";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";

type Props = {
  onGenerated: (content: string) => void;
  systemPrompt: string;
};

const AiGeneratorButton: React.FC<Props> = ({ onGenerated, systemPrompt }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast("Введите тему для генерации.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CEREBRAS_API_KEY}`
        },
        body: JSON.stringify({
          model: "zai-glm-4.7",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "";

      onGenerated(reply);
      setIsOpen(false);
      setPrompt("");

    } catch (e: any) {
      console.error(e);
      showToast(`Ошибка генерации: ${e.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={styles.aiButton}
        title="Сгенерировать с помощью ИИ"
      >
        ✨ Сгенерировать
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Генерация контента с помощью ИИ</h3>
            <p className={styles.modalDescription}>
              Введите тему или ключевые слова, и нейросеть сгенерирует для вас текст.
              Системный промпт уже настроен для получения качественной HTML-разметки.
            </p>
            <textarea
              className={styles.promptTextarea}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Например: 'Напиши статью о пользе чтения'"
              rows={5}
            />
            <div className={styles.modalActions}>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                onClick={handleGenerate}
                className={styles.generateButton}
                disabled={isLoading}
              >
                {isLoading ? "Генерация..." : "Сгенерировать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiGeneratorButton;

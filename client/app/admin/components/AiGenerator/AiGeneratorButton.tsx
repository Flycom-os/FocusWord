"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import styles from "./AiGenerator.module.css";

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
      showToast("Enter a topic for generation.", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CEREBRAS_API_KEY}`,
        },
        body: JSON.stringify({
          model: "zai-glm-4.7",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
        }),
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
      showToast(`Generation error: ${e.message}`, "error");
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
        title="Generate with AI"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
      >
        <Sparkles size={14} /> Generate
      </button>

      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>AI Content Generation</h3>
            <p className={styles.modalDescription}>
              Enter a topic or keywords, and the neural network will generate text for you. The
              system prompt is already configured to get high-quality HTML markup.
            </p>
            <textarea
              className={styles.promptTextarea}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="For example: 'Write an article about the benefits of reading'"
              rows={5}
            />
            <div className={styles.modalActions}>
              <button
                onClick={() => setIsOpen(false)}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className={styles.generateButton}
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiGeneratorButton;

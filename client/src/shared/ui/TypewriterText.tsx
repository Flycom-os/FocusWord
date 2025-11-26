import React, { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  duration?: number; // общая длительность анимации в мс
  className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, duration = 500, className }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed(""); // сброс при смене текста
    let i = 0;
    const step = Math.max(duration / text.length, 20);
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, step);
    return () => clearInterval(interval);
  }, [text, duration]);

  return (
    <span className={className} style={{ display: "inline-block", maxWidth: "100%", overflow: "hidden", whiteSpace: "nowrap" }}>
      {displayed}
    </span>
  );
};

export default TypewriterText; 
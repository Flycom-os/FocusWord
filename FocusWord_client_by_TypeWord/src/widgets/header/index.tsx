"use client";

import Link from "next/link";
import styles from "@/src/widgets/header/index.module.css";
import { ChevronLeft, ChevronDown } from "lucide-react";
import classNames from "@/src/shared/lib/classnames/classnames";
import Button from "@/src/shared/ui/Button/ui-button";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  payload: {
    id: number;
    name: string;
    email: string;
    role: {
      id: number;
      name: string;
    };
  };
  iat: number;
  exp: number;
}

const Header = ({ className }: { className?: string }) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setUserName(decoded.payload.name);
      } catch (e) {
        console.error("Ошибка при разборе токена:", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest?.(`.${styles.button_name}`) && !target.closest?.(`.${styles.dropdownMenu}`)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  return (
    <div className={classNames(styles.header, {}, [className || ""])}>
      <Link href="/">
        <Button theme="mini" className={styles.button}>
          <ChevronLeft className={styles.chevron} />
          Назад
        </Button>
      </Link>
      <div style={{ position: "relative", display: "inline-block", marginLeft: "auto" }}>
        <Button
          className={styles.button_name}
          theme="mini"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          {userName ?? "Gust"}
          <ChevronDown />
        </Button>
        {dropdownOpen && (
          <div className={styles.dropdownMenu}>
            <Button
              className={styles.dropdownItem}
              onClick={() => {
                setDropdownOpen(false);
                // TODO: переход к профилю
              }}
            >
              Просмотр профиля
            </Button>
            <Button
              className={styles.dropdownItem}
              onClick={() => {
                setDropdownOpen(false);
                // TODO: логаут
              }}
              style={{ color: '#d32f2f' }}
            >
              Выйти
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;



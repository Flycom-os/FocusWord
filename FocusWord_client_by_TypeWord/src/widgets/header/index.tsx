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

  return (
    <div className={classNames(styles.header, {}, [className || ""])}>
      <Link href="/">
        <Button theme="mini" className={styles.button}>
          <ChevronLeft className={styles.chevron} />
          Назад
        </Button>
      </Link>
      <Button className={styles.button_name} theme="mini">
        {userName ?? "Gust"}
        <ChevronDown />
      </Button>
    </div>
  );
};

export default Header;

import Link from "next/link";
import { Button } from "@/src/shared/ui";
import styles from "@/src/widgets/header/index.module.css";
import { ChevronLeft, ChevronDown } from "lucide-react";
import classNames from "@/src/shared/lib/classnames/classnames";
const username = "Global_layout";
const Header = ({ className }: { className?: string }) => {
  return (
    <div className={classNames(styles.header, {}, [className || ""])}>
      <Link href="/">
        <Button theme="mini" className={styles.button}>
          <ChevronLeft className={styles.chevron} />
          Назад
        </Button>
      </Link>
      <Button className={styles.button_name} theme="mini">
        {username}
        <ChevronDown />
      </Button>
    </div>
  );
};

export default Header;

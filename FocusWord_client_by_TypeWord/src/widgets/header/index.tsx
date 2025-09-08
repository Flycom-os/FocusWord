import Link from "next/link";
import styles from "@/src/widgets/header/index.module.css";
import { ChevronLeft, ChevronDown, Cookie } from "lucide-react";
import classNames from "@/src/shared/lib/classnames/classnames";
import Button from "@/src/shared/ui/Button/ui-button";
import { cookies } from "next/headers";


const username = "Global_layout";
// const usr:any = cookies['access_token'];
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

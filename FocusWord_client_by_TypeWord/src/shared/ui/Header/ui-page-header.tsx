import styles from "@/src/shared/ui/Header/ui-header.module.css";
import Link from "next/link";

type Props = {
  title: string;
  subTitle?: string;
};

const UiPageHeader = ({ title, subTitle }: Props) => {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.header_main_title}>{title}</h1>
        <nav className={styles.header_main_nav}>
          <Link className={styles.header_sub_title} href="admin/media-files">
            {title}/
          </Link>
          <Link className={styles.header_sub_title} href="/">
            {subTitle}
          </Link>
        </nav>
      </div>
    </header>
  );
};

UiPageHeader.defaultProps = {
  subTitle: "",
};

export default UiPageHeader;

'use client'
import Input from "@/src/shared/ui/Input/ui-input";
import styles from "@/src/pages/home/index.module.css";
import { Checkbox } from "@/src/shared/ui";
import Search from "@/src/widgets/search";
import { useEffect, useState } from "react";
/**
 * @page Home
 */

const HomePage = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    console.log(!isChecked);
  };
  return (
    <div className={styles.container}>
      <Input
        className={styles.input}
        type="text"
        theme="secondary"
        icon="right"
        placeholder="Primary Input"
      />
      <Checkbox checked={isChecked} onChange={handleCheckboxChange} />
    </div>
  );
};
//TODO: fix login
//TODO: fix page, wiki, get pages
//TODO: fix admin: mediafiles, sliders, pages, records, category records, sidbear
//TODO: fix header, footer
//TODO: fix header footer global cms
//TODO: roles: fix in server initialization, dix in front access, fix methods, and add roles in admin

export default HomePage;

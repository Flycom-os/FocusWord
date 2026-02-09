import React from "react";
import Input from "@/src/shared/ui/Input/ui-input";
import { useState } from "react";
import styles from "@/src/widgets/search/index.module.css";
import Button from "@/src/shared/ui/Button/ui-button";


interface searchProps {
  setSearchValue: (searchInput: string) => void;
}
const Search = ({ setSearchValue }: searchProps) => {
  const [searchInput, setSearchInput] = useState("");
  const handleClick = () => {
    setSearchValue(searchInput);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchValue(searchInput);
    }
  };
  return (
    <div className={styles.search}>
      <Input
        type="text"
        className={styles.input}
        theme="secondary"
        error={false}
        icon="left"
        placeholder="Search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.kbd} role="button" aria-label="Search shortcut" onClick={handleClick}>/
      </div>
    </div>
  );
};
export default Search;

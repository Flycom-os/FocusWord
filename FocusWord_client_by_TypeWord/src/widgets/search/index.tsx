import { Button } from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";
import { useState } from "react";
import styles from "@/src/widgets/search/index.module.css";

interface searchProps {
  setSearchValue: (searchInput: string) => void;
}
const Search = ({ setSearchValue }: searchProps) => {
  const [searchInput, setSearchInput] = useState("");
  const handleClick = () => {
    setSearchValue(searchInput);
  };
  return (
    <div className={styles.search}>
      <Input
        type="text"
        className={styles.input}
        theme="secondary"
        error={false}
        icon="left"
        placeholder="Введите текст..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
      <div className={styles.button}>
        <Button onClick={handleClick} theme="secondary">
          Поиск
        </Button>
      </div>
    </div>
  );
};
export default Search;

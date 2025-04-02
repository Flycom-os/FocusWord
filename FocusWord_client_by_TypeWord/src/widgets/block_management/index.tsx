import { Button } from "@/src/shared/ui";
import { ChevronDown, Plus, X } from "lucide-react";
import styles from "@/src/widgets/block_management/index.module.css";

interface searchProps {
  type?: VariantsType;
}
type VariantsType = "primary" | "secondary" | "third" | "";
const choosen = 2;
const BlockManagement = ({ type }: searchProps) => {
  return (
    <div className={styles.default}>
      {(type === "primary" || type === "secondary") && (
        <div className={styles.primary_or_secondary}>
          <Button className={styles.close} theme={"close"}>
            <X className={styles.x} />
          </Button>
          <div className={styles.text}>Выбранно: {choosen}</div>
          <Button theme={"warning"}>Удалить</Button>
        </div>
      )}
      {type === "secondary" && (
        <div className={styles.secondary_or_third}>
          <Button theme="third">Открыть оригинал</Button>
          <Button theme="third">Открыть миниатюру</Button>
          <Button theme="third">Редактировать</Button>
        </div>
      )}
      {type === "third" && (
        <div className={styles.secondary_or_third}>
          <Button theme="third">
            Файл <ChevronDown />
          </Button>
          <Button theme="third">
            Автор <ChevronDown />
          </Button>
          <Button theme="third">
            Дата <ChevronDown />
          </Button>
        </div>
      )}
      <Button theme="third" className={styles.add}>
        <Plus />
        Добавить
      </Button>
    </div>
  );
};
export default BlockManagement;

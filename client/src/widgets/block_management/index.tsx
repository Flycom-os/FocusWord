import { ChevronDown, Plus, X } from "lucide-react";
import styles from "@/src/widgets/block_management/index.module.css";
import Button from "@/src/shared/ui/Button/ui-button";

interface searchProps {
  type?: VariantsType;
}
type VariantsType = "primary" | "secondary" | "third" | "";
const choosen = 2;
const BlockManagement = ({ type }: searchProps) => {
  return (
    <div></div>
    // <div className={styles.default}>
    //   {(type === "primary" || type === "secondary") && (
    //     <div className={styles.primary_or_secondary}>
    //       <Button className={styles.close} theme="close">
    //         <X className={styles.x} />
    //       </Button>
    //       <div className={styles.text}>Selected: {choosen}</div>
    //       <Button theme="warning">Delete</Button>
    //     </div>
    //   )}
    //   {type === "secondary" && (
    //     <div className={styles.secondary_or_third}>
    //       <Button theme="third">Open Original</Button>
    //       <Button theme="third">Open Thumbnail</Button>
    //       <Button theme="third">Edit</Button>
    //     </div>
    //   )}
    //   {type === "third" && (
    //     <div className={styles.secondary_or_third}>
    //       <Button theme="third">
    //         File <ChevronDown />
    //       </Button>
    //       <Button theme="third">
    //         Author <ChevronDown />
    //       </Button>
    //       <Button theme="third">
    //         Date <ChevronDown />
    //       </Button>
    //     </div>
    //   )}
    //   <Button theme="third" className={styles.add}>
    //     <Plus />
    //     Add
    //   </Button>
    // </div>
  );
};
export default BlockManagement;

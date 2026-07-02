import { OutputBlockData } from "@editorjs/editorjs";
import { PageDto } from "@/src/shared/api/pages";
import { blocksFromPage } from "@/src/shared/lib/page-content";

export function parsePageBlocks(page: PageDto): OutputBlockData[] {
  return blocksFromPage(page);
}

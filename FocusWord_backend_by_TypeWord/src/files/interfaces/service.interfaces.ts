//interfaces for file.service.ts
export interface MiniatureInfoIntf {
  miniaturePath: string | null;
  miniaturePathSystem: string | null;
  miniatureSize: string | null;
}

export interface WriteNewFileIntrf {
  image: boolean;
  filePath: string;
  filepathSystem: string;
  miniatureInfo: MiniatureInfoIntf;
}

export interface GetFileIntf {
  file_path: string;
}

export interface GetForPageIntf<T> {
  current_page: number;
  total_pages?: number;
  count?: number;
  rows: T[];
}

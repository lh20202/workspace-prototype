import type { OperationalFile } from "../logistics/data";
import type { LibraryDocument } from "../sharepoint/library";
export interface FunctionalArea {
  id: string;
  name: string;
  summary: string;
  tool?: string;
}
export interface WorkingItem {
  id: string;
  area: string;
  name: string;
  owner: string;
  status: string;
  due: string;
  nextAction: string;
  kind: string;
  source?: string;
}
export interface WorkingFile extends OperationalFile {
  area: string;
  workType: string;
  reference: string;
  documentLibrary?: string;
  folderPath?: string;
  contentType?: string;
  metadata?: Record<string, string>;
  versions?: LibraryDocument["versions"];
}
export interface ProtectedSubject {
  id: string;
  name: string;
  area: string;
  strict?: boolean;
}
export interface FunctionalConfig {
  id: string;
  areas: FunctionalArea[];
  items: WorkingItem[];
  files: WorkingFile[];
  protected: ProtectedSubject[];
  tools: { id: string; name: string; purpose: string }[];
}

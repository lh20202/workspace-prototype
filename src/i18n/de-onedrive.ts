import { germanOneDriveDepartment } from "./de-onedrive-department";
import { germanOneDriveTechnical } from "./de-onedrive-technical";

export const germanOneDrive: Record<string, string> = {
  ...germanOneDriveDepartment,
  ...germanOneDriveTechnical,
};

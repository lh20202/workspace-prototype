import SensitivityBadge from "../sharepoint/SensitivityBadge";
import DocumentIcon from "../components/DocumentIcon";
import { type OperationalFile } from "./data";
import { fileHref } from "./query";
export function FileStatus({ status }: { status: string }) {
  return (
    <span
      className={`status operational-${status.toLowerCase().replaceAll(" ", "-")}`}
    >
      {status === "Completed" ? "✓ " : ""}
      {status}
    </span>
  );
}
export function shortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
export default function FileTable({
  items,
  onOpen,
  sharePointLinks = false,
  onSort,
  sort,
  descending = false,
}: {
  items: OperationalFile[];
  onOpen: (file: OperationalFile) => void;
  sharePointLinks?: boolean;
  onSort?: (key: keyof OperationalFile) => void;
  sort?: keyof OperationalFile;
  descending?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="operational-table">
        <thead>
          <tr>
            <th className="file-column" aria-label="File type" />
            {(
              [
                ["name", "Name"],
                ["campaign", "Campaign"],
                ["type", "Document type"],
                ["status", "Status"],
                ["owner", "Owner"],
                ["sensitivity", "Sensitivity"],
                ["modified", "Modified"],
              ] as const
            ).map(([key, label]) => (
              <th
                key={key}
                className={
                  key === "sensitivity"
                    ? "sp-library-column-sensitivity"
                    : undefined
                }
                aria-sort={
                  sort === key
                    ? descending
                      ? "descending"
                      : "ascending"
                    : "none"
                }
              >
                {onSort ? (
                  <button onClick={() => onSort(key)}>
                    {label}
                    {sort === key ? (descending ? " ↓" : " ↑") : ""}
                  </button>
                ) : (
                  label
                )}
              </th>
            ))}
            {sharePointLinks && <th>Location</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((file) => (
            <tr key={file.id}>
              <td>
                <DocumentIcon name={file.name} />
              </td>
              <td>
                <button className="document-name" onClick={() => onOpen(file)}>
                  {file.name}
                </button>
              </td>
              <td>{file.campaign}</td>
              <td>{file.type}</td>
              <td>
                <FileStatus status={file.status} />
              </td>
              <td>{file.owner}</td>
              <td className="sp-library-column-sensitivity">
                <SensitivityBadge value={file.sensitivity} />
              </td>
              <td>{shortDate(file.modified)}</td>
              {sharePointLinks && (
                <td>
                  <a className="text-link" href={fileHref(file)}>
                    Open workspace
                  </a>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length && (
        <div className="empty-state">
          <h3>No files match</h3>
          <p>Try another view or clear the search and filters.</p>
        </div>
      )}
    </div>
  );
}

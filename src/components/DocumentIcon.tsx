export default function DocumentIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()!;
  return (
    <span className={`file-icon ${ext}`} aria-label={`${ext} file`}>
      {ext === "xlsx"
        ? "X"
        : ext === "pptx"
          ? "P"
          : ext === "pdf"
            ? "PDF"
            : "W"}
    </span>
  );
}

export default function DocumentIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()!;
  return (
    <span className={`file-icon ${ext}`} aria-label={`${ext} file`}>
      {["yaml", "yml", "json", "md"].includes(ext)
        ? ext === "md"
          ? "MD"
          : "{}"
        : ext === "xlsx"
          ? "X"
          : ext === "pptx"
            ? "P"
            : ext === "pdf"
              ? "PDF"
              : "W"}
    </span>
  );
}

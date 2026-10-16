import { technicalPosts, gitHref } from "./technicalTeams";
export default function TechnicalConversation({
  channel,
}: {
  channel: string;
}) {
  return (
    <>
      <p className="technical-channel-note">
        Working engineering discussion · Links open fictional Company Git
        references.
      </p>
      {technicalPosts
        .filter((p) => p.channel === channel)
        .map((p, i) => (
          <article className="technical-thread" key={i}>
            <strong>{p.author}</strong>
            <p>{p.text}</p>
            <a href={gitHref(p.repo, p.kind, p.ref)}>
              {p.kind === "pr"
                ? "View pull request"
                : p.kind === "issue"
                  ? "Open issue"
                  : p.kind === "release"
                    ? "View release"
                    : "Open repository"}{" "}
              · {p.repo}
              {p.ref ? ` #${p.ref}` : ""} ↗
            </a>
            <aside>{p.reply}</aside>
          </article>
        ))}
    </>
  );
}

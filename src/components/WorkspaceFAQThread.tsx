import { configById } from "../workspaces/config";
import { workspaceById } from "../workspaces/registry";
import { technicalPosts } from "../workspaces/technicalTeams";
import { functionalFileHref } from "../workspaces/siteArchitecture";
import StaffLink from "./StaffLink";
import TeamsMark from "./TeamsMark";

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

/** A read-only view of the same conversation shown in the full Teams demo. */
export default function WorkspaceFAQThread() {
  const workspace = configById.get("digital");
  const post = technicalPosts.find(
    (message) => message.id === "digital-onedrive-review",
  );
  if (!workspace || !post) return null;
  const linkedFile = workspace.files.find(
    (file) => file.id === post.fileLink?.fileId,
  );
  return (
    <section className="workspace-faq-thread" aria-label="Teams exchange">
      <header className="workspace-faq-thread-channel">
        <TeamsMark size={20} />
        <div>
          <strong>{workspaceById.get(workspace.id)?.title}</strong>
          <span>{post.channel}</span>
        </div>
      </header>
      <article className="workspace-faq-thread-post">
        <header className="workspace-faq-thread-author">
          <span className="workspace-faq-thread-avatar" aria-hidden="true">
            {initials(post.author)}
          </span>
          <strong>{post.author}</strong>
          <time>{post.time}</time>
          {post.fileLink?.correctedFrom && <span> · Edited</span>}
        </header>
        <p>{post.text}</p>
        {linkedFile && (
          <p>
            <StaffLink href={functionalFileHref(workspace, linkedFile.id)}>
              {linkedFile.name}
            </StaffLink>
          </p>
        )}
        <div className="workspace-faq-thread-replies">
          {post.replies?.map((reply, index) => (
            <article className="workspace-faq-thread-reply" key={index}>
              <span className="workspace-faq-thread-avatar" aria-hidden="true">
                {initials(reply.author)}
              </span>
              <div>
                <header className="workspace-faq-thread-author">
                  <strong>{reply.author}</strong>
                  {reply.moderator && (
                    <span className="workspace-faq-thread-moderator">
                      MODERATOR
                    </span>
                  )}
                  {reply.time && <time>{reply.time}</time>}
                </header>
                <p>{reply.text}</p>
                {reply.link && (
                  <StaffLink href={reply.link.href}>
                    {reply.link.label}
                  </StaffLink>
                )}
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  );
}

import { resolveDepartment } from "../coordination/data";
import DocumentIcon from "./DocumentIcon";
import OneDriveSourceNote from "./OneDriveSourceNote";
import SensitivityBadge from "../sharepoint/SensitivityBadge";
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
  const department = resolveDepartment("marketing-growth");
  const post = department?.posts.find(
    (message) => message.id === "marketing-growth-onedrive",
  );
  if (!department || !post) return null;
  const attachment = post.upload;
  const replies = [
    ...(post.moderatorReply && attachment
      ? [
          {
            author: department.coordinator.name,
            text: post.moderatorReply,
            moderator: true,
            time: undefined,
            link: {
              href: attachment.destination,
              label: `Open destination: ${attachment.destinationName} →`,
            },
          },
        ]
      : []),
    ...(post.replies || []),
  ];
  return (
    <section className="workspace-faq-thread" aria-label="Teams exchange">
      <header className="workspace-faq-thread-channel">
        <TeamsMark size={20} />
        <div>
          <strong>{department.name}</strong>
          <span>General</span>
        </div>
      </header>
      <article className="workspace-faq-thread-post">
        <header className="workspace-faq-thread-author">
          <span className="workspace-faq-thread-avatar" aria-hidden="true">
            {initials(post.author)}
          </span>
          <strong>{post.author}</strong>
          <time>{post.time}</time>
        </header>
        <p>{post.text}</p>
        {attachment && (
          <div className="workspace-faq-thread-attachment">
            <DocumentIcon name={attachment.name} />
            <div>
              <s>{attachment.name}</s>
              <div className="workspace-faq-thread-file-meta">
                <SensitivityBadge value={attachment.sensitivity} />
                <span>Attachment removed</span>
              </div>
              <OneDriveSourceNote />
            </div>
          </div>
        )}
        <div className="workspace-faq-thread-replies">
          {replies.map((reply, index) => (
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

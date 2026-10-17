import { initials } from "../teams/TeamsShell";
import type { ProjectHistoricalPost } from "./conversations";

export default function ProjectHistory({
  posts,
}: {
  posts: ProjectHistoricalPost[];
}) {
  return posts.map((post) => (
    <article className="teams-post" key={post.id} id={post.id}>
      <div className="post-top">
        <span className="post-avatar" aria-hidden="true">
          {initials(post.author)}
        </span>
        <div>
          <strong>{post.author}</strong>
          <span>{post.time}</span>
        </div>
      </div>
      <p>{post.text}</p>
      {post.replies.map((reply, index) => (
        <article
          className="teams-thread-reply"
          key={index}
          aria-label={`Reply from ${reply.author}`}
        >
          <span className="post-avatar small" aria-hidden="true">
            {initials(reply.author)}
          </span>
          <div className="thread-reply-body">
            <header>
              <strong>{reply.author}</strong>
              <span>{reply.time}</span>
            </header>
            <p>{reply.text}</p>
          </div>
        </article>
      ))}
    </article>
  ));
}

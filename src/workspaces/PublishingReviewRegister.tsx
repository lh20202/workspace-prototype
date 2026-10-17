import { useState } from "react";
import StaffLink from "../components/StaffLink";
import { matchesDisplayText } from "../i18n/search";
import { environmentReviews, type EnvironmentReview } from "./publishing";

const statuses: EnvironmentReview["status"][] = [
  "Needs review",
  "Awaiting owner",
  "In progress",
  "Complete",
];

export default function PublishingReviewRegister({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [reviews, setReviews] = useState(environmentReviews);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("Reviews due");
  if (compact)
    return (
      <section
        className="functional-current-work"
        aria-labelledby="publishing-reviews-title"
      >
        <h2 id="publishing-reviews-title">Reviews due</h2>
        {reviews.slice(0, 2).map((review) => (
          <StaffLink
            className="functional-recent-file"
            href="/workspace-publishing/reviews"
            key={review.id}
          >
            <span>
              {review.area}
              <small>
                {review.owner} · {review.due}
              </small>
            </span>
          </StaffLink>
        ))}
      </section>
    );
  const visible = reviews.filter(
    (review) =>
      (view !== "Reviews due" || review.status !== "Complete") &&
      (view !== "Navigation & Findability" ||
        ["PUB-101", "PUB-104", "PUB-105"].includes(review.id)) &&
      matchesDisplayText(
        [
          review.environment,
          review.area,
          review.owner,
          review.moderator,
          review.action,
          review.status,
          review.destinationType,
        ].join("\n"),
        query,
      ),
  );
  return (
    <>
      <div className="functional-toolbar">
        <select
          aria-label="Environment review view"
          value={view}
          onChange={(event) => setView(event.target.value)}
        >
          {["Reviews due", "Navigation & Findability", "All reviews"].map(
            (name) => (
              <option key={name}>{name}</option>
            ),
          )}
        </select>
        <input
          aria-label="Search environment reviews"
          placeholder="Search this list"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="functional-table">
        <table aria-label="Environment Review Register">
          <thead>
            <tr>
              {[
                "Environment / Area",
                "Owner",
                "Moderator",
                "Review due",
                "Status",
                "Issue / action",
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((review) => (
              <tr key={review.id}>
                <td>
                  <strong>{review.environment}</strong>
                  <br />
                  {review.area}
                  <br />
                  <small>{review.destinationType}</small>
                </td>
                <td>{review.owner}</td>
                <td>{review.moderator}</td>
                <td>{review.due}</td>
                <td>
                  <select
                    aria-label={`Status for ${review.area}`}
                    value={review.status}
                    onChange={(event) =>
                      setReviews(
                        reviews.map((item) =>
                          item.id === review.id
                            ? {
                                ...item,
                                status: event.target
                                  .value as EnvironmentReview["status"],
                              }
                            : item,
                        ),
                      )
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td>
                  {review.action}
                  <br />
                  <StaffLink href={review.href}>Open environment →</StaffLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <p>No reviews in this view.</p>}
      </div>
    </>
  );
}

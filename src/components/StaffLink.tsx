import type { ComponentPropsWithoutRef } from "react";
import { withExplicitStaff } from "../utils/staffNavigation";

/** A normal anchor that retains an explicit preview colleague on internal links. */
export default function StaffLink({
  href,
  ...props
}: ComponentPropsWithoutRef<"a">) {
  return <a href={href ? withExplicitStaff(href) : href} {...props} />;
}

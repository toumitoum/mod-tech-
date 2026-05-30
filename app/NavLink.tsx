"use client";

import { cn } from "@/lib/utils";
import Link,{ LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";

interface NavLinkCompatProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: LinkProps["href"];
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, href, children, ...props }, ref) => {
    const pathname = usePathname() || "";
    const hrefStr = typeof href === "string" ? href : href ? String(href) : "";
    const isActive = pathname === hrefStr;
    const isPending = false;

    return (
      <Link href={href} legacyBehavior>
        <a
          ref={ref}
          className={cn(className, isActive && activeClassName, isPending && pendingClassName)}
          {...props}
        >
          {children}
        </a>
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };

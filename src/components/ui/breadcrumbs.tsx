import * as React from "react";
import { Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
}

export function Breadcrumbs({
  items,
  showHomeIcon = true,
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs md:text-sm text-foreground-secondary", className)}
      {...props}
    >
      <ol className="flex items-center flex-wrap gap-1.5">
        {showHomeIcon && (
          <li className="flex items-center">
            <Link
              to="/"
              className="hover:text-accent flex items-center transition-colors text-foreground-muted"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={item.label + index}>
              {(showHomeIcon || index > 0) && (
                <ChevronRight className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
              )}
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="hover:text-accent transition-colors font-medium text-foreground-secondary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-primary truncate max-w-40 sm:max-w-none">
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

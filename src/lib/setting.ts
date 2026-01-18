type Crumb = {
  href: string;
  label: string;
  isCurrent: boolean;
};

import { routes } from "./constants";

// ✅ Only treat true IDs as "Details"
function isIdLike(segment: string) {
  if (!segment) return false;

  // Pure number → likely an ID
  if (/^\d+$/.test(segment)) return true;

  // Mongo ObjectId style (24 hex chars)
  if (/^[a-f0-9]{24}$/i.test(segment)) return true;

  // UUID v4 style
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      segment
    )
  ) {
    return true;
  }

  // Otherwise, NOT an ID → treat as slug/title
  return false;
}

function humanizeSegment(segment: string) {
  return segment
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getBreadcrumbs(pathname: string): Crumb[] {
  if (pathname === "/") {
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        isCurrent: true,
      },
    ];
  }

  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];

  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    const fromRoutes = routes.navMain.find((r) => r.href === currentPath);

    let label: string;
    if (fromRoutes) {
      label = fromRoutes.label;
    } else if (isIdLike(segment)) {
      label = "Details";
    } else {
      label = humanizeSegment(segment);
    }

    crumbs.push({
      href: currentPath,
      label,
      isCurrent: index === segments.length - 1,
    });
  });

  if (crumbs.length === 0) {
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        isCurrent: true,
      },
    ];
  }

  return crumbs;
}

export function getPageTitleFromBreadcrumbs(crumbs: Crumb[]): string {
  if (!crumbs.length) return "Dashboard";
  return crumbs[crumbs.length - 1]!.label;
}

import React from "react";
import { Link, useLocation } from "react-router-dom";

const routeNameMap = {
  "/": "Dashboard",
  "/doctors": "Doctors",
  "/patients": "Patients",
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  
  const crumbs = [{ label: "JDent Lite", href: "/" }];
  let currentPath = "";

  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    const label =
      routeNameMap[currentPath] ||
    (index === 1 && pathParts[0] === "patients" ? "Details" :  part.charAt(0).toUpperCase() + part.slice(1));
    crumbs.push({
      label,
      href: index === pathParts.length -1 ? null : currentPath,
    });
  });

let currentPageName = "Dashboard";

if (pathParts.length > 0) {
  if (pathParts.length === 2 && pathParts[0] === "patients") {
    currentPageName = "Patient Details";
  } else {
    const lastPart = pathParts[pathParts.length - 1];
    currentPageName = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  }
}

  return (
    <div className="p-6 mx-2 flex justify-between">
      {/* ✅ Page Title */}
      <h2 className="text-lg font-semibold">
        {currentPageName}
      </h2>

      {/* ✅ Breadcrumb trail */}
      <div className="text-sm text-primary flex items-center gap-2">
        {crumbs.map((crumb, index) => (
          <span key={index} className="flex items-center">
            {crumb.href ? (
              <Link to={crumb.href} className="text-primary hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
            {index < crumbs.length - 1 && <span className="mx-1">/</span>}
          </span>
        ))}
      </div>
    </div>
  );
};

import * as React from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({ title, description, action, className, titleClassName, descriptionClassName }) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        {title ? (
          <div className={cn("text-lg font-semibold", titleClassName)}>{title}</div>
        ) : null}
        {description ? (
          <div className={cn("text-sm text-gray-500", descriptionClassName)}>{description}</div>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

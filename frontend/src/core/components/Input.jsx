import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full bg-gray-100 rounded-lg px-4 py-2.5 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
        className
      )}
      {...props}
    />
  );
}

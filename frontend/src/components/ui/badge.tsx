import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono tracking-wider",
  {
    variants: {
      variant: {
        default:
          "border-primary/40 bg-primary/10 text-primary",
        secondary:
          "border-outline-variant/40 bg-surface-container text-on-surface-variant",
        cyan:
          "border-tertiary/40 bg-tertiary/10 text-tertiary",
        emerald:
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
        purple:
          "border-secondary/40 bg-secondary-container/30 text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

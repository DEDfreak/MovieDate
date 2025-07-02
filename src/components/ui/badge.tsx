import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#e82833] text-white hover:bg-[#c62229]",
        secondary:
          "border-transparent bg-[#472326] text-[#c69193] hover:bg-[#663335]",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: 
          "text-[#c69193] border-[#663335] hover:bg-[#472326]",
        success:
          "border-transparent bg-green-900/30 text-green-400 border-green-800",
        warning:
          "border-transparent bg-orange-900/30 text-orange-400 border-orange-800",
        info:
          "border-transparent bg-blue-900/30 text-blue-400 border-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 
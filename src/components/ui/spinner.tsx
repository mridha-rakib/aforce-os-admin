import { Loader2Icon } from "lucide-react"
import type { ComponentProps } from "react"

import { cn } from "@/utils/cn"

function Spinner({ className, ...props }: ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin text-[#C8FF00]", className)}
      {...props}
    />
  )
}

export { Spinner }

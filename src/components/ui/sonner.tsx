import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import type { CSSProperties } from "react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#C8FF00]" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#C8FF00]" />,
      }}
      style={
        {
          "--normal-bg": "#0e1218",
          "--normal-text": "#e8edf5",
          "--normal-border": "#1e2632",
          "--success-bg": "#101706",
          "--success-text": "#C8FF00",
          "--success-border": "rgb(200 255 0 / 45%)",
          "--border-radius": "14px",
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

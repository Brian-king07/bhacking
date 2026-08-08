"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-4 text-white" />,
        info: <InfoIcon className="size-4 text-white" />,
        warning: <TriangleAlertIcon className="size-4 text-white" />,
        error: <OctagonXIcon className="size-4 text-white" />,
        loading: <Loader2Icon className="size-4 animate-spin text-white" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "cn-toast !border-transparent !text-white !shadow-lg [&>[data-close-button]]:!border-white/30 [&>[data-close-button]]:!bg-white/10 [&>[data-close-button]]:!text-white",
          title: "!text-white !font-medium",
          description: "!text-white/90",
          success: "!bg-emerald-800 !text-white",
          error: "!bg-red-600 !text-white",
          info: "!bg-emerald-800 !text-white",
          warning: "!bg-amber-600 !text-white",
          loading: "!bg-emerald-800 !text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

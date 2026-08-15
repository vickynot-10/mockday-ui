import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size"
> {
  variant?: "default" | "outline" | "success" | "danger";
  size?: "default" | "xs" | "sm" | "lg";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function AppVariantButton({
  variant = "default",
  size = "default",
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isCustom = variant === "danger" || variant === "success";

  const class_var = ` ${
    variant === "danger"
      ? "bg-red-500 hover:bg-red-500/80 text-white"
      : variant === "success"
      ? "bg-green-500 hover:bg-green-500/80 text-white"
      : ""
  } cursor-pointer ${className ?? ""}`;

  return (
    <div className="group">
      <Button
        variant={isCustom ? undefined : variant}
        className={class_var}
        size={size}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="animate-spin" /> : children}
      </Button>
    </div>
  );
}
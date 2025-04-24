
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({ title, description, action, icon: Icon, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-16", className)}>
      {Icon && (
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-medium mt-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mt-1">{description}</p>
      {action && (
        <Link to={action.href} className="mt-6">
          <Button>
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}

export default EmptyState;

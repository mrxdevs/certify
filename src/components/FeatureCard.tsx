
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
  className?: string;
}

export function FeatureCard({ title, description, icon: Icon, iconClassName, className }: FeatureCardProps) {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow", className)}>
      <div className={cn("rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4", 
        iconClassName || "bg-brand-100 text-brand-600")}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default FeatureCard;

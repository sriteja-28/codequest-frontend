import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="w-14 h-14 rounded-2xl bg-surface-200 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-500" />
      </div>
      <p className="font-medium text-slate-300 mb-1">{title}</p>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
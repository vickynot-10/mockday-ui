import { HomeIcon, type LucideIcon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type BreadCrumbProps = {
  href?: string;
  label: string;
  icon?: LucideIcon;
  isSection?: boolean;
};

interface BreadCrumbsProps {
  items: BreadCrumbProps[];
}

export default function BreadCrumbs({ items }: BreadCrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <div key={item.label + index} className="flex items-center gap-1.5">
              <BreadcrumbItem>
                {item.isSection ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {Icon && <Icon className="size-4" />}
                    {item.label}
                  </span>
                ) : isLast || !item.href ? (
                  <BreadcrumbPage className="flex items-center gap-2">
                    {Icon && <Icon className="size-4" />}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href} className="flex items-center gap-2">
                    {Icon && <Icon className="size-4" />}
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator> / </BreadcrumbSeparator>}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
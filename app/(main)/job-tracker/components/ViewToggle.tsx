"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { KanbanSquare, Table2Icon } from "lucide-react";
import { motion ,type Variants } from "motion/react";
const kanbanVariants :Variants= {
  active: {
    scale: 1.1,
    y: [0, -1, 1, -1, 0],
    transition: {
      y: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut",
      },
      scale: { duration: 0.2 },
    },
  },
  inactive: {
    scale: 1,
    y: 0,
    rotate: 0,
  },
  hover: {
    scale: 1.15,
    rotate: [0, -5, 5, 0],
    transition: { duration: 0.3 },
  },
};

const tableVariants :Variants= {
  active: {
    scale: 1.1,
    rotate: [0, -10, 10, -8, 8, 0],
    transition: {
      rotate: {
        repeat: Infinity,
        repeatDelay: 1.2,
        duration: 0.8,
        ease: "easeInOut",
      },
      scale: { duration: 0.2 },
    },
  },
  inactive: {
    scale: 1,
    rotate: 0,
    y: 0,
  },
  hover: {
    scale: 1.15,
    y: [0, -3, 0],
    transition: {
      y: {
        repeat: Infinity,
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  },
};

const views = [
  {
    id: "kanban",
    icon: <KanbanSquare aria-hidden="true" />,
    variants: kanbanVariants,
  },
  {
    id: "table",
    icon: <Table2Icon aria-hidden="true" />,
    variants: tableVariants,
  },
];

const ViewToggleButtonGroup = ({
  view,
  setView,
}: {
  view: string;
  setView: (view: string) => void;
}) => {
  return (
    <ButtonGroup>
      {views.map((v) => {
        const isActive = view === v.id;
        const borderRadiusClass =
          v.id === "kanban" ? "rounded-l-lg! rounded-r-none!" : "rounded-l-none! rounded-r-lg!";

        return (
          <Button
            key={v.id}
            variant="outline"
            className={cn(
              "relative overflow-hidden transition-colors duration-300 cursor-pointer",
              borderRadiusClass,
              isActive
                ? "text-primary-foreground hover:text-primary-foreground border-transparent"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setView(v.id)}
          >
            {isActive && (
              <motion.span
                layoutId="active-view-bg"
                className="absolute inset-0 bg-primary"
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                }}
                style={{ borderRadius: "inherit" }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <motion.span
                className="inline-flex items-center justify-center"
                variants={v.variants}
                animate={isActive ? "active" : "inactive"}
                whileHover="hover"
              >
                {v.icon}
              </motion.span>
            </span>
          </Button>
        );
      })}
    </ButtonGroup>
  );
};

export default ViewToggleButtonGroup;
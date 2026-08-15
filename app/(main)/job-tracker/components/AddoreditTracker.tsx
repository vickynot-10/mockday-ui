
"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppButton } from "@/components/common/AppButton";
import AppIconButton from "@/components/common/AppIconButton";
import { ChevronDown, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type TrackerForm = {
  _id?: string | null;
  company: string;
  title: string;
  url: string;
  description: string;
  page_title: string;
  h1: string;
  site_name: string;
};

const EMPTY_FORM: TrackerForm = {
  company: "",
  title: "",
  url: "",
  description: "",
  page_title: "",
  h1: "",
  site_name: "",
};

export default function AddOrEditTrackerModal({
  row,
}: {
  row?: TrackerForm | null;
}) {
    console.log(row ,"fromm")
  const isEditMode = !!row;
  const [open, setOpen] = useState(false);
  const [showScraped, setShowScraped] = useState(false);

  const { register, handleSubmit, reset } = useForm<TrackerForm>({
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    if (!open) return;
    setShowScraped(false);
    reset(row ?? EMPTY_FORM);
  }, [open, row]);

  function onSubmit(values: TrackerForm) {
    const payload = isEditMode ? { ...values, _id: row?._id } : values;
   console.log(payload)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <AppIconButton
          icon={
            isEditMode ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )
          }
          tooltip={isEditMode ? "Edit" : "Add"}
          variant={isEditMode ? "ghost" : "default"}
          size="icon"
          className="h-8 w-8"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Tracker" : "New Tracker"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" {...register("company", { required: true })} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Role</Label>
            <Input id="title" {...register("title")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="url">Job URL</Label>
            <Input id="url" {...register("url")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowScraped((prev) => !prev)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
            >
              Scraped details
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  showScraped && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {showScraped && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="site_name">Source Site</Label>
                    <Input id="site_name" {...register("site_name")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="page_title">Page Title</Label>
                    <Input id="page_title" {...register("page_title")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="h1">Page Heading</Label>
                    <Input id="h1" {...register("h1")} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DialogFooter>
            <AppButton
              type="submit"
              idleLabel={isEditMode ? "Save Changes" : "Create Tracker"}
              loadingLabel={isEditMode ? "Saving..." : "Creating..."}
              successLabel={isEditMode ? "Saved!" : "Created!"}
              
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
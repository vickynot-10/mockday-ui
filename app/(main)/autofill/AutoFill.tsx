"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { useForm, FormProvider } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { Save, Briefcase, ListChecks, CircleUserRound } from "lucide-react";
import AutoFillSkeleton from "@/loaders/autofill.loader";
import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AppButton } from "@/components/common/AppButton";
import AppVariantButton from "@/components/common/AppVariantButton";
import { useGetAutoFill, useSaveAutoFill } from "@/hooks/queries/useAutofills";
import { FormValues } from "@/types/autofill.types";
import DetailsTab from "./components/DetailsTab";
import RulesTab from "./components/RulesTab";
import AboutYouTab from "./components/AboutYou";

const items = [{ label: "Apps", isSection: true }, { label: "Autofills" }];

const tabs = [
  { id: "details", label: "Default Fields", icon: Briefcase },
  { id: "rules", label: "Field Rules", icon: ListChecks },
  { id: "about_you", label: "About You", icon: CircleUserRound },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

const transition = { type: "spring", stiffness: 340, damping: 32 } as const;

function formatUpdatedOn(dateStr?: string) {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function AutoFill() {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [direction, setDirection] = useState(1);
  const { isLoading, data } = useGetAutoFill();
  const { mutate, isPending } = useSaveAutoFill();

  const methods = useForm<FormValues>({
    defaultValues: {
      email: "",
      phone: "",
      experience: [],
      rules: [{ label: "", answer: "" }],
      about_you: "",
    },
  });

  const { handleSubmit, reset } = methods;
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (!data || !data?.data || hasHydrated.current) return;
    hasHydrated.current = true;
    const {
      email,
      phone,
      experience,
      about_you,
      _id,
      created_on,
      updated_on,
      ...rest
    } = data.data;

    const rules = Object.entries(rest).map(([label, answer]) => ({
      label,
      answer: answer as string,
    }));

    reset({
      email: email ?? "",
      phone: phone ?? "",
      experience: Array.isArray(experience) ? experience : [],
      rules: rules.length > 0 ? rules : [{ label: "", answer: "" }],
      about_you: about_you ?? "",
    });
  }, [data, reset]);

  function handleTabChange(newId: string) {
    const prevIdx = tabs.findIndex((t) => t.id === activeTab);
    const nextIdx = tabs.findIndex((t) => t.id === newId);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    setActiveTab(newId);
  }

  if (isLoading) {
    return <AutoFillSkeleton />;
  }

  const onSubmit = (data: FormValues) => {
    const rulesObject = Object.fromEntries(
      data.rules
        .map((r) => ({ label: r.label.trim(), answer: r.answer.trim() }))
        .filter((r) => r.label !== "" || r.answer !== "")
        .map((r) => [r.label, r.answer]),
    );

    const experiencePayload = data.experience
      .filter((e) => e.point.trim() !== "" || e.start_date !== "")
      .map((e) => ({
        point: e.point.trim(),
        start_date: e.start_date,
        end_date: e.currently_working_on ? null : e.end_date,
        currently_working_on: e.currently_working_on,
      }));

    const payload = {
      email: data.email.trim(),
      phone: data.phone.trim(),
      experience: experiencePayload,
      about_you: data.about_you.trim(),
      ...rulesObject,
    };

    mutate(payload);
  };

  function CloseDialog() {
    setResetDialogOpen(false);
  }

  function OpenDialog() {
    setResetDialogOpen(true);
  }

  const confirmResetForm = () => {
    reset();
    setResetDialogOpen(false);
  };

  const lastUpdated = formatUpdatedOn(data?.data?.updated_on);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <BreadCrumbs items={items} />
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full shrink-0 mb-4"
          >
            <TabsList
              variant="line"
              className="flex w-full border-b border-border overflow-x-hidden bg-transparent p-0! rounded-none h-auto! gap-0! justify-start!"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "relative flex items-center justify-center cursor-pointer text-sm font-medium transition-colors outline-none whitespace-nowrap bg-transparent",
                      "data-[state=active]:bg-transparent data-[state=active]:text-foreground",
                      "dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-transparent dark:data-[state=active]:text-foreground",
                      "border-transparent data-[state=active]:border-transparent shadow-none data-[state=active]:shadow-none after:hidden",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className="relative flex items-center gap-2 px-4 py-3 rounded-md z-10">
                      <Icon className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{tab.label}</span>
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="autofill-tabs-indicator"
                        className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          <div className="space-y-8 pb-24 relative overflow-x-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {activeTab === "details" && (
                <motion.div
                  key="details"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  className="space-y-8"
                >
                  <DetailsTab />
                </motion.div>
              )}

              {activeTab === "rules" && (
                <motion.div
                  key="rules"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  <RulesTab activeTab={activeTab} />
                </motion.div>
              )}

              {activeTab === "about_you" && (
                <motion.div
                  key="about_you"
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                >
                  <AboutYouTab />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur py-4 flex justify-end gap-2">
            <AppVariantButton
              type="button"
              onClick={OpenDialog}
              className="h-11 px-4"
            >
              Reset
            </AppVariantButton>

            <AppButton
              type="submit"
              icon={Save}
              isLoading={isPending}
              idleLabel="Save Changes"
              loadingLabel="Saving..."
              successLabel="Saved Successfully!"
              className="h-11 py-0"
            />
          </div>
        </form>
      </FormProvider>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-9sm">
          <DialogHeader>
            <DialogTitle>Reset form?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This can't be undone the fields entered will be reset.</p>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-2">
            <AppVariantButton size="sm" onClick={CloseDialog}>
              Cancel
            </AppVariantButton>
            <AppVariantButton
              variant="danger"
              size="sm"
              onClick={confirmResetForm}
            >
              Reset
            </AppVariantButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
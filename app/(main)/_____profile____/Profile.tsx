"use client";
import {
  useGetProfileSettings,
  useSaveProfileSettings,
} from "@/hooks/queries/useProfile";
import { useEffect, useState } from "react";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { AppButton } from "@/components/common/AppButton";
import { useForm } from "react-hook-form";

const items = [{ label: "Settings", isSection: true }, { label: "Profile" }];

export default function Profile() {
  const { data } = useGetProfileSettings();
  const { mutate: saveNotifications, isPending } = useSaveProfileSettings();

  return (
    <>
      <BreadCrumbs items={items} />
    </>
  );
}

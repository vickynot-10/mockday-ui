"use client";
import { useGetAllStatus } from "@/hooks/queries/useTrackers";

type EditProps = {
  id: string;
};

export default function StatusMenu({ id }: EditProps) {
    const { data } = useGetAllStatus()
    return <> {id} </>
}

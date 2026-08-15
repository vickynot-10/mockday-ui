import AddOrEditJobTracker from "../../components/AddoreditTracker";

export default async function EditTrackerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return null;

  return <AddOrEditJobTracker id={id} />;
}

import { Facility } from "../facility";

export default async function EditFacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Facility kodeFacility={decodeURIComponent(id)} />;
}
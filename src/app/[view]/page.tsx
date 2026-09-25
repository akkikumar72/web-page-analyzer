import { notFound } from "next/navigation";
import {
  Workspace,
  type WorkspaceView,
} from "@/components/workspace/workspace";

const views = ["history", "saved", "settings", "guide"] as const;
export function generateStaticParams() {
  return views.map((view) => ({ view }));
}
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ view: string }>;
}) {
  const { view } = await params;
  if (!views.some((item) => item === view)) notFound();
  return <Workspace view={view as WorkspaceView} />;
}

import { PageHeader } from "@/components/page-header";
import { PlannerBoard } from "@/components/planner-board";

export default function PlannerPage() {
  return (
    <div>
      <PageHeader
        title="Planner"
        description="Organize your tasks, notes, and schedule on your virtual dry-erase board."
      />
      <div className="p-6 md:p-8 pt-0">
        <PlannerBoard />
      </div>
    </div>
  );
}
import { PageHeader } from "@/components/page-header";

export default function ComplianceDashboardPage() {
  return (
    <div className="h-full w-full flex flex-col">
      <PageHeader
        title="KAA Governance Dashboard"
        description="A dashboard for tracking the corrective action plan and compliance."
      />
      <div className="flex-grow p-6 md:p-8 pt-0">
        <iframe
          src="/governance-dashboard.html"
          className="w-full h-full border-0 rounded-md shadow-lg"
          title="KAA Governance Dashboard"
        />
      </div>
    </div>
  );
}

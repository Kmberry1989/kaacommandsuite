import { PageHeader } from "@/components/page-header";

export default function RoleAnalyzerPage() {
  return (
    <div className="h-full w-full flex flex-col">
      <PageHeader
        title="KAA Role Analyzer"
        description="An interactive dashboard analyzing the KAA's presidential role."
      />
      <div className="flex-grow p-6 md:p-8 pt-0">
        <iframe
          src="/role-analyzer.html"
          className="w-full h-full border-0 rounded-md shadow-lg"
          title="KAA Role Analyzer"
        />
      </div>
    </div>
  );
}

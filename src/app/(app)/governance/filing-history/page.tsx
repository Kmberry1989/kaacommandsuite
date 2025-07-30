// src/app/(app)/governance/filing-history/page.tsx

import dynamic from 'next/dynamic';

// Dynamically import the viewer component with SSR turned off
const FilingHistoryViewer = dynamic(() => import('./FilingHistoryViewer'), {
  ssr: false,
  loading: () => <p>Loading PDF viewer...</p>, // Optional: show a loading message
});

export default function FilingHistoryPage() {
  return (
    <div>
      {/* This component will now only be rendered in the browser,
        avoiding the server-side build error.
      */}
      <FilingHistoryViewer />
    </div>
  );
}

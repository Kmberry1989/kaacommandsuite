// src/app/(app)/governance/filing-history/page.tsx

'use client'; // <-- This is the only line you need to add!

import dynamic from 'next/dynamic';

// Dynamically import the viewer component with SSR turned off
const FilingHistoryViewer = dynamic(() => import('./FilingHistoryViewer'), {
  ssr: false,
  loading: () => <p>Loading PDF viewer...</p>, 
});

export default function FilingHistoryPage() {
  return (
    <div>
      <FilingHistoryViewer />
    </div>
  );
}

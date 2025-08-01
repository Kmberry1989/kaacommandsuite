'use client';
import { PageHeader } from '@/components/page-header';
import FilingHistoryViewer from './FilingHistoryViewer';

export default function FilingHistoryPage() {
  const documents = [
    { name: 'Business Information', path: '/filinghistory/Business Information.pdf' },
    { name: 'Filing History 10771246', path: '/filinghistory/10771246_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 7543431', path: '/filinghistory/7543431_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 8146972', path: '/filinghistory/8146972_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838548', path: '/filinghistory/838548_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838549', path: '/filinghistory/838549_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838550', path: '/filinghistory/838550_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838551', path: '/filinghistory/838551_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838552', path: '/filinghistory/838552_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838553', path: '/filinghistory/838553_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838554', path: '/filinghistory/838554_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838555', path: '/filinghistory/838555_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838556', path: '/filinghistory/838556_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838557', path: '/filinghistory/838557_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838558', path: '/filinghistory/838558_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838559', path: '/filinghistory/838559_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838560', path: '/filinghistory/838560_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838561', path: '/filinghistory/838561_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838562', path: '/filinghistory/838562_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838563', path: '/filinghistory/838563_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838564', path: '/filinghistory/838564_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838565', path: '/filinghistory/838565_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838566', path: '/filinghistory/838566_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838567', path: '/filinghistory/838567_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838568', path: '/filinghistory/838568_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838569', path: '/filinghistory/838569_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838570', path: '/filinghistory/838570_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838571', path: '/filinghistory/838571_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838572', path: '/filinghistory/838572_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838573', path: '/filinghistory/838573_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838574', path: '/filinghistory/838574_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838575', path: '/filinghistory/838575_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838576', path: '/filinghistory/838576_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838577', path: '/filinghistory/838577_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838578', path: '/filinghistory/838578_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838579', path: '/filinghistory/838579_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838580', path: '/filinghistory/838580_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838581', path: '/filinghistory/838581_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838582', path: '/filinghistory/838582_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838583', path: '/filinghistory/838583_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838584', path: '/filinghistory/838584_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838585', path: '/filinghistory/838585_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838586', path: '/filinghistory/838586_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838587', path: '/filinghistory/838587_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 838588', path: '/filinghistory/838588_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 8855201', path: '/filinghistory/8855201_FilingHistoryDocuments.pdf' },
    { name: 'Filing History 9703097', path: '/filinghistory/9703097_FilingHistoryDocuments.pdf' },
  ];

  return (
    <>
      <PageHeader
        title="Filing History"
        description="Browse and review historical filing documents."
      />
      <div className="mt-6">
        <FilingHistoryViewer documents={documents} />
      </div>
    </>
  );
}

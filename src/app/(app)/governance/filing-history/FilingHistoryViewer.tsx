'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Specify the worker path for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentFile {
  name: string;
  path: string;
}

interface FilingHistoryViewerProps {
  documents: DocumentFile[];
}

export default function FilingHistoryViewer({ documents }: FilingHistoryViewerProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(documents[0] || null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1); // Reset to first page on new doc load
  }

  const handleDocChange = (docName: string) => {
    const doc = documents.find(d => d.name === docName);
    setSelectedDoc(doc || null);
  };

  const goToPrevPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    if (numPages) {
      setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Viewer</CardTitle>
        <div className="flex flex-wrap items-center gap-4 pt-4">
          <Select onValueChange={handleDocChange} defaultValue={selectedDoc?.name}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a document" />
            </SelectTrigger>
            <SelectContent>
              {documents.map((doc) => (
                <SelectItem key={doc.name} value={doc.name}>
                  {doc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {numPages && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>
                Page {pageNumber} of {numPages}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextPage} disabled={pageNumber >= numPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
           <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setScale(s => s * 1.2)}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setScale(s => s / 1.2)}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[70vh] overflow-auto bg-gray-100 rounded-lg p-4">
          {selectedDoc ? (
            <Document
              file={selectedDoc.path}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={console.error}
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a document to view.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

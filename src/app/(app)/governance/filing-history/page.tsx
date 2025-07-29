"use client";'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Corrected CSS imports
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

type PDFFile = string | File | null;

export default function FilingHistoryPage() {
  const [file, setFile] = useState<PDFFile>('./990_2023.pdf');
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }): void {
    setNumPages(nextNumPages);
  }
'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Corrected CSS imports
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

type PDFFile = string | File | null;

export default function FilingHistoryPage() {
  const [file, setFile] = useState<PDFFile>('./990_2023.pdf');
  const [numPages, setNumPages] = useState<number>();
'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Corrected CSS imports
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const options = {
  cMapUrl: '/cmaps/',
  standardFontDataUrl: '/standard_fonts/',
};

type PDFFile = string | File | null;

export default function FilingHistoryPage() {
  const [file, setFile] = useState<PDFFile>('./990_2023.pdf');
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }): void {
    setNumPages(nextNumPages);
  }

  return (
    <div className="flex justify-center">
      <div>
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="mb-4"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }): void {
    setNumPages(nextNumPages);
  }

  return (
    <div className="flex justify-center">
      <div>
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="mb-4"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
  return (
    <div className="flex justify-center">
      <div>
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="mb-4"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileWarning, FileCheck2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// PDF.js worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// List of your PDF files in the public/filinghistory directory
const filingHistoryFiles = [
    "10771246_FilingHistoryDocuments.pdf",
    "7543431_FilingHistoryDocuments.pdf",
    "8146972_FilingHistoryDocuments.pdf",
    "838548_FilingHistoryDocuments.pdf",
    "838549_FilingHistoryDocuments.pdf",
    "838550_FilingHistoryDocuments.pdf",
    "838551_FilingHistoryDocuments.pdf",
    "838552_FilingHistoryDocuments.pdf",
    "838553_FilingHistoryDocuments.pdf",
    "838554_FilingHistoryDocuments.pdf",
    "838555_FilingHistoryDocuments.pdf",
    "838556_FilingHistoryDocuments.pdf",
    "838557_FilingHistoryDocuments.pdf",
    "838558_FilingHistoryDocuments.pdf",
    "838559_FilingHistoryDocuments.pdf",
    "838560_FilingHistoryDocuments.pdf",
    "838561_FilingHistoryDocuments.pdf",
    "838562_FilingHistoryDocuments.pdf",
    "838563_FilingHistoryDocuments.pdf",
    "838564_FilingHistoryDocuments.pdf",
    "838565_FilingHistoryDocuments.pdf",
    "838566_FilingHistoryDocuments.pdf",
    "838567_FilingHistoryDocuments.pdf",
    "838568_FilingHistoryDocuments.pdf",
    "838569_FilingHistoryDocuments.pdf",
    "838570_FilingHistoryDocuments.pdf",
    "838571_FilingHistoryDocuments.pdf",
    "838572_FilingHistoryDocuments.pdf",
    "838573_FilingHistoryDocuments.pdf",
    "838574_FilingHistoryDocuments.pdf",
    "838575_FilingHistoryDocuments.pdf",
    "838576_FilingHistoryDocuments.pdf",
    "838577_FilingHistoryDocuments.pdf",
    "838578_FilingHistoryDocuments.pdf",
    "838579_FilingHistoryDocuments.pdf",
    "838580_FilingHistoryDocuments.pdf",
    "838581_FilingHistoryDocuments.pdf",
    "838582_FilingHistoryDocuments.pdf",
    "838583_FilingHistoryDocuments.pdf",
    "838584_FilingHistoryDocuments.pdf",
    "838585_FilingHistoryDocuments.pdf",
    "838586_FilingHistoryDocuments.pdf",
    "838587_FilingHistoryDocuments.pdf",
    "838588_FilingHistoryDocuments.pdf",
    "8855201_FilingHistoryDocuments.pdf",
    "9703097_FilingHistoryDocuments.pdf",
    "Business Information.pdf"
];

type AnalysisStatus = "idle" | "loading" | "compliant" | "non-compliant";

export default function FilingHistoryPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [analysisResult, setAnalysisResult] = useState("");

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setAnalysisStatus("idle");
    setAnalysisResult("");
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setAnalysisStatus("loading");
    setAnalysisResult("");

    try {
      const pdf = await pdfjs.getDocument(`/filinghistory/${selectedFile}`).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(" ");
      }

      if (fullText.toLowerCase().includes("llc")) {
        setAnalysisStatus("non-compliant");
        setAnalysisResult("The term 'LLC' was found in this document.");
      } else {
        setAnalysisStatus("compliant");
        setAnalysisResult("The term 'LLC' was not found. The document appears to be compliant.");
      }
    } catch (error) {
      console.error("Error analyzing PDF:", error);
      setAnalysisStatus("idle");
      setAnalysisResult("An error occurred while analyzing the document.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Filing History Analyzer"
        description="Review historical filings and check for compliance issues."
      />
      <div className="p-6 md:p-8 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Select a Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={(value) => setSelectedFile(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a filing document..." />
                </SelectTrigger>
                <SelectContent>
                  {filingHistoryFiles.map((file) => (
                    <SelectItem key={file} value={file}>
                      {file}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={handleAnalyze} disabled={!selectedFile || analysisStatus === 'loading'} className="w-full">
                {analysisStatus === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Analyze for "LLC"
              </Button>

              {analysisStatus !== 'idle' && (
                 <Alert variant={analysisStatus === 'compliant' ? 'default' : 'destructive'}>
                    {analysisStatus === 'compliant' ? <FileCheck2 className="h-4 w-4" /> : <FileWarning className="h-4 w-4" />}
                    <AlertTitle>
                        {analysisStatus === 'compliant' ? 'Compliance Check: Passed' : 'Compliance Check: Failed'}
                    </AlertTitle>
                    <AlertDescription>{analysisResult}</AlertDescription>
                 </Alert>
              )}

            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Document Viewer</CardTitle>
            </CardHeader>
            <CardContent className="h-[70vh] overflow-y-auto border rounded-md">
              {selectedFile ? (
                <Document
                  file={`/filinghistory/${selectedFile}`}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}
                  error={<div className="p-4 text-red-500">Failed to load PDF.</div>}
                >
                  {Array.from(new Array(numPages || 0), (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  ))}
                </Document>
              ) : (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  <p>Please select a document to view it here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

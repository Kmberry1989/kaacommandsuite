"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, Folder, Image as ImageIcon, FileText, BarChart2 } from "lucide-react";
import Image from "next/image";

const assets = {
  images: [
    { name: "Spring Gala Banner", type: "Image", date: "2024-05-15", src: "https://placehold.co/600x400.png", dataAiHint: "art gallery event" },
    { name: "Artist Spotlight Headshot", type: "Image", date: "2024-05-12", src: "https://placehold.co/600x400.png", dataAiHint: "artist portrait" },
    { name: "Workshop Materials Photo", type: "Image", date: "2024-05-10", src: "https://placehold.co/600x400.png", dataAiHint: "art supplies" },
  ],
  documents: [
    { name: "Q2 Impact Report.pdf", type: "Document", date: "2024-06-01", icon: FileText },
    { name: "Grant Application Draft.docx", type: "Document", date: "2024-05-28", icon: FileText },
    { name: "Press Release - Spring Gala.docx", type: "Document", date: "2024-05-14", icon: FileText },
  ],
  visualizations: [
    { name: "Membership Growth Chart", type: "Chart", date: "2024-06-02", icon: BarChart2 },
    { name: "Social Media Infographic", type: "Chart", date: "2024-05-20", icon: BarChart2 },
  ],
};

const AssetCard = ({ asset }: { asset: any }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-0">
      {asset.type === "Image" ? (
        <Image
          src={asset.src}
          alt={asset.name}
          width={400}
          height={300}
          className="aspect-[4/3] w-full object-cover"
          data-ai-hint={asset.dataAiHint}
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-secondary flex items-center justify-center">
            <asset.icon className="h-16 w-16 text-muted-foreground" />
        </div>
      )}
    </CardContent>
    <CardFooter className="flex-col items-start p-4">
        <p className="font-semibold">{asset.name}</p>
        <p className="text-sm text-muted-foreground mb-4">Uploaded: {asset.date}</p>
        <div className="flex w-full justify-between items-center">
            <span className="text-xs py-1 px-2 rounded-full bg-secondary text-secondary-foreground">{asset.type}</span>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
            </div>
        </div>
    </CardFooter>
  </Card>
);


export default function AssetsPage() {
  return (
    <div>
      <PageHeader
        title="Asset Command"
        description="A centralized library for all your creative and administrative assets."
      >
        <Button>Upload Asset</Button>
      </PageHeader>
      <div className="p-6 md:p-8 pt-0">
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all"><Folder className="mr-2 h-4 w-4"/> All</TabsTrigger>
            <TabsTrigger value="images"><ImageIcon className="mr-2 h-4 w-4"/> Images</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="mr-2 h-4 w-4"/> Documents</TabsTrigger>
            <TabsTrigger value="visualizations"><BarChart2 className="mr-2 h-4 w-4"/> Visualizations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {[...assets.images, ...assets.documents, ...assets.visualizations].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(asset => <AssetCard key={asset.name} asset={asset} />)}
          </TabsContent>
          <TabsContent value="images" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {assets.images.map(asset => <AssetCard key={asset.name} asset={asset} />)}
          </TabsContent>
          <TabsContent value="documents" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {assets.documents.map(asset => <AssetCard key={asset.name} asset={asset} />)}
          </TabsContent>
          <TabsContent value="visualizations" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {assets.visualizations.map(asset => <AssetCard key={asset.name} asset={asset} />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

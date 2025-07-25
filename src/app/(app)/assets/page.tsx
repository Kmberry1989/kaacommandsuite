"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, Folder, Image as ImageIcon, FileText, BarChart2, PlusCircle } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

type ImageAsset = {
  id: string;
  name: string;
  type: "Image";
  date: string;
  src: string;
  dataAiHint?: string;
};

type DocumentAsset = {
  id: string;
  name: string;
  type: "Document";
  date: string;
  icon: typeof FileText;
};

type VisualizationAsset = {
    id: string;
    name: string;
    type: "Chart";
    date: string;
    icon: typeof BarChart2;
};

type Asset = ImageAsset | DocumentAsset | VisualizationAsset;

const AssetCard = ({ asset }: { asset: Asset }) => (
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
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Image+Not+Found'; }}
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
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [newAsset, setNewAsset] = useState({ name: "", type: "Image" });
    const { toast } = useToast();
    
    async function fetchAssets() {
        try {
          const imagesSnap = await getDocs(collection(db, "images"));
          const documentsSnap = await getDocs(collection(db, "documents"));
          const visualizationsSnap = await getDocs(collection(db, "visualizations"));
  
          const allAssets: Asset[] = [
            ...imagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Image' } as ImageAsset)),
            ...documentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Document', icon: FileText } as DocumentAsset)),
            ...visualizationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Chart', icon: BarChart2 } as VisualizationAsset)),
          ];
          
          setAssets(allAssets.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err) {
          console.error("Failed to fetch assets from Firebase:", err);
        }
      }
  
    useEffect(() => {
      fetchAssets();
    }, []);
  
    const handleAddAsset = async () => {
      const collectionName = `${newAsset.type.toLowerCase()}s`;
      const newAssetData = {
        name: newAsset.name,
        date: new Date().toISOString().split('T')[0],
        ...(newAsset.type === 'Image' && { src: 'https://placehold.co/600x400/png', dataAiHint: 'new asset' }),
      };

      try {
        await addDoc(collection(db, collectionName), newAssetData);
        toast({ title: "Asset Added", description: `${newAsset.name} has been added to your library.`});
        fetchAssets(); // Refresh assets
        setUploadDialogOpen(false);
        setNewAsset({ name: "", type: "Image" });
      } catch (error) {
        console.error("Error adding asset:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add the asset."});
      }
    };
  
    const allAssets = assets;
    const imageAssets = assets.filter(a => a.type === 'Image');
    const documentAssets = assets.filter(a => a.type === 'Document');
    const visualizationAssets = assets.filter(a => a.type === 'Chart');
  
    return (
      <div>
        <PageHeader
          title="Asset Command"
          description="A centralized library for all your creative and administrative assets."
        >
          <Button onClick={() => setUploadDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
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
               {allAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
            </TabsContent>
            <TabsContent value="images" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {imageAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
            </TabsContent>
            <TabsContent value="documents" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {documentAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
            </TabsContent>
            <TabsContent value="visualizations" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {visualizationAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
            </TabsContent>
          </Tabs>
        </div>
  
         <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Asset</DialogTitle>
              <DialogDescription>
                Add a new image, document, or visualization to your asset library.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="asset-name"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  className="col-span-3"
                  placeholder="e.g., Summer Workshop Flyer"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-type" className="text-right">
                  Type
                </Label>
                 <Select
                    value={newAsset.type}
                    onValueChange={(value) => setNewAsset({...newAsset, type: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Image">Image</SelectItem>
                      <SelectItem value="Document">Document</SelectItem>
                      <SelectItem value="Chart">Visualization/Chart</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleAddAsset} disabled={!newAsset.name}>Add Asset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
}

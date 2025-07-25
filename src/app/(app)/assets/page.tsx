"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase"; // Make sure storage is exported from firebase.ts
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, Folder, Image as ImageIcon, FileText, BarChart2, PlusCircle, Loader2 } from "lucide-react";
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

type ImageAsset = {
  id: string;
  name: string;
  type: "Image";
  date: string;
  src: string;
};

type DocumentAsset = {
  id: string;
  name: string;
  type: "Document";
  date: string;
  src: string; // Add src for download link
  icon: typeof FileText;
};

type VisualizationAsset = {
    id: string;
    name: string;
    type: "Chart";
    date: string;
    src: string; // Add src for download link
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
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Image+Error'; }}
        />
      ) : (
        <a href={asset.src} target="_blank" rel="noopener noreferrer" className="aspect-[4/3] w-full bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
            <asset.icon className="h-16 w-16 text-muted-foreground" />
        </a>
      )}
    </CardContent>
    <CardFooter className="flex-col items-start p-4">
        <p className="font-semibold">{asset.name}</p>
        <p className="text-sm text-muted-foreground mb-4">Uploaded: {asset.date}</p>
        <div className="flex w-full justify-between items-center">
            <span className="text-xs py-1 px-2 rounded-full bg-secondary text-secondary-foreground">{asset.type}</span>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
                <a href={asset.src} download={asset.name}>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </a>
            </div>
        </div>
    </CardFooter>
  </Card>
);

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newAssetName, setNewAssetName] = useState("");
    const [newAssetType, setNewAssetType] = useState("Image");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    async function fetchAssets() {
      // Logic remains the same, but now `src` will be a real URL
      const collections = {
        images: { type: 'Image', icon: null },
        documents: { type: 'Document', icon: FileText },
        visualizations: { type: 'Chart', icon: BarChart2 },
      };
      
      let allAssets: Asset[] = [];
      for (const [key, value] of Object.entries(collections)) {
        const snap = await getDocs(collection(db, key));
        const assetsData = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: value.type,
            ...(value.icon && { icon: value.icon })
        } as Asset));
        allAssets = [...allAssets, ...assetsData];
      }
      
      setAssets(allAssets.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  
    useEffect(() => {
      fetchAssets();
    }, []);

    const resetUploadForm = () => {
        setNewAssetName("");
        setNewAssetType("Image");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
  
    const handleAddAsset = async () => {
      if (!selectedFile || !newAssetName) {
        toast({ variant: "destructive", title: "Missing Info", description: "Please provide a name and select a file."});
        return;
      }

      setIsUploading(true);
      const collectionName = `${newAssetType.toLowerCase()}s`;
      const storagePath = `${collectionName}/${Date.now()}-${selectedFile.name}`;
      const storageRef = ref(storage, storagePath);

      try {
        // 1. Upload file to Storage
        await uploadBytes(storageRef, selectedFile);
        
        // 2. Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        // 3. Save metadata to Firestore
        await addDoc(collection(db, collectionName), {
            name: newAssetName,
            date: new Date().toISOString().split('T')[0],
            src: downloadURL,
            fileName: selectedFile.name,
            fileType: selectedFile.type,
        });

        toast({ title: "Asset Uploaded!", description: `${newAssetName} is now in your library.`});
        fetchAssets(); // Refresh assets
        setUploadDialogOpen(false);
        resetUploadForm();
      } catch (error) {
        console.error("Error uploading asset:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload the asset."});
      } finally {
        setIsUploading(false);
      }
    };
  
    const allAssets = assets;
    const imageAssets = assets.filter(a => a.type === 'Image');
    const documentAssets = assets.filter(a => a.type === 'Document');
    const visualizationAssets = assets.filter(a => a.type === 'Chart');
  
    return (
      <div>
        <PageHeader title="Asset Command" description="A centralized library for all your creative and administrative assets.">
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
            {/* Other TabsContent here */}
          </Tabs>
        </div>
  
         <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetUploadForm(); setUploadDialogOpen(isOpen); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Asset</DialogTitle>
              <DialogDescription>
                Add a new image, document, or visualization to your asset library.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-name" className="text-right">Name</Label>
                <Input id="asset-name" value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} className="col-span-3" placeholder="e.g., Summer Workshop Flyer" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-type" className="text-right">Type</Label>
                 <Select value={newAssetType} onValueChange={setNewAssetType}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Image">Image</SelectItem>
                      <SelectItem value="Document">Document</SelectItem>
                      <SelectItem value="Chart">Visualization/Chart</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-file" className="text-right">File</Label>
                <Input id="asset-file" type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button onClick={handleAddAsset} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Asset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
}

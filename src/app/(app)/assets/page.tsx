"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, Folder, Image as ImageIcon, FileText, BarChart2, PlusCircle, Trash2, Upload } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

type AssetType = "Image" | "Document" | "Chart";

type BaseAsset = {
  id: string;
  name: string;
  type: AssetType;
  date: string;
  storagePath?: string;
};

type ImageAsset = BaseAsset & {
  type: "Image";
  src: string;
};

type DocumentAsset = BaseAsset & { type: "Document" };
type VisualizationAsset = BaseAsset & { type: "Chart" };

type Asset = ImageAsset | DocumentAsset | VisualizationAsset;

// --- AssetCard Component (Moved outside and refactored) ---
const AssetCard = ({ asset, onDelete }: { asset: Asset; onDelete: (asset: Asset) => void; }) => {
  const getIcon = (type: AssetType) => {
    switch (type) {
      case "Document": return <FileText className="h-16 w-16 text-muted-foreground" />;
      case "Chart": return <BarChart2 className="h-16 w-16 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0">
        {asset.type === "Image" ? (
          <Image
            src={asset.src}
            alt={asset.name}
            width={400}
            height={300}
            className="aspect-[4/3] w-full object-cover"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/e2e8f0/e2e8f0?text=Error'; }}
          />
        ) : (
          <div className="aspect-[4/3] w-full bg-secondary flex items-center justify-center">
            {getIcon(asset.type)}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start p-4 flex-grow">
          <p className="font-semibold">{asset.name}</p>
          <p className="text-sm text-muted-foreground mb-4">Uploaded: {asset.date}</p>
          <div className="flex w-full justify-between items-center mt-auto">
              <span className="text-xs py-1 px-2 rounded-full bg-secondary text-secondary-foreground">{asset.type}</span>
              <div className="flex gap-1">
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(asset)}><Trash2 className="h-4 w-4" /></Button>
              </div>
          </div>
      </CardFooter>
    </Card>
  );
};


export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    const [newAssetFile, setNewAssetFile] = useState<File | null>(null);
    const [newAssetName, setNewAssetName] = useState("");
    const [newAssetType, setNewAssetType] = useState<AssetType>("Image");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    async function fetchAssets() {
        setIsLoading(true);
        try {
          const imagesSnap = await getDocs(collection(db, "images"));
          const documentsSnap = await getDocs(collection(db, "documents"));
          const visualizationsSnap = await getDocs(collection(db, "visualizations"));
  
          const allAssets: Asset[] = [
            ...imagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageAsset)),
            ...documentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Document' } as DocumentAsset)),
            ...visualizationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Chart' } as VisualizationAsset)),
          ];
          
          setAssets(allAssets.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (err) {
          console.error("Failed to fetch assets from Firebase:", err);
          toast({ variant: "destructive", title: "Error", description: "Could not fetch assets."});
        } finally {
            setIsLoading(false);
        }
      }
  
    useEffect(() => {
      fetchAssets();
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewAssetFile(file);
            setNewAssetName(file.name.split('.').slice(0, -1).join('.'));
        }
    };
  
    const handleUploadAsset = async () => {
        if (!newAssetFile) {
            toast({ variant: "destructive", title: "No file selected", description: "Please choose a file to upload." });
            return;
        }
        setIsUploading(true);
        setUploadProgress(0);
        
        const collectionName = `${newAssetType.toLowerCase()}s`;
        const storagePath = `${collectionName}/${Date.now()}_${newAssetFile.name}`;
        const storageRef = ref(storage, storagePath);

        try {
            // Simulate progress for now, replace with actual upload task later if needed
            await new Promise(res => setTimeout(res, 500)); setUploadProgress(30);
            const snapshot = await uploadBytes(storageRef, newAssetFile);
            await new Promise(res => setTimeout(res, 500)); setUploadProgress(70);
            const downloadURL = await getDownloadURL(snapshot.ref);
            await new Promise(res => setTimeout(res, 500)); setUploadProgress(100);

            const newAssetData: Omit<Asset, 'id'> = {
                name: newAssetName || newAssetFile.name,
                date: new Date().toISOString().split('T')[0],
                type: newAssetType,
                storagePath: storagePath,
                ...(newAssetType === 'Image' && { src: downloadURL }),
            };
    
            await addDoc(collection(db, collectionName), newAssetData);
            
            toast({ title: "Asset Uploaded", description: `${newAssetData.name} has been added.`});
            fetchAssets(); // Refresh assets
            setUploadDialogOpen(false);
            
        } catch (error) {
            console.error("Error uploading asset:", error);
            toast({ variant: "destructive", title: "Upload Error", description: "Could not upload the asset."});
        } finally {
            setIsUploading(false);
            setNewAssetFile(null);
            setNewAssetName("");
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteAsset = async () => {
        if (!assetToDelete) return;

        const collectionName = `${assetToDelete.type.toLowerCase()}s`;
        
        try {
            // Delete from Firestore
            await deleteDoc(doc(db, collectionName, assetToDelete.id));

            // Delete from Storage if path exists
            if (assetToDelete.storagePath) {
                const storageRef = ref(storage, assetToDelete.storagePath);
                await deleteObject(storageRef);
            }
            
            toast({ title: "Asset Deleted", description: `${assetToDelete.name} has been removed.`});
            fetchAssets();
        } catch (error) {
            console.error("Error deleting asset:", error);
            toast({ variant: "destructive", title: "Deletion Error", description: "Could not delete the asset."});
        } finally {
            setAssetToDelete(null);
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
              <TabsTrigger value="visualizations"><BarChart2 className="mr-2 h-4 w-4"/> Charts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {allAssets.map(asset => <AssetCard key={asset.id} asset={asset} onDelete={setAssetToDelete} />)}
            </TabsContent>
            <TabsContent value="images" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {imageAssets.map(asset => <AssetCard key={asset.id} asset={asset} onDelete={setAssetToDelete} />)}
            </TabsContent>
            <TabsContent value="documents" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {documentAssets.map(asset => <AssetCard key={asset.id} asset={asset} onDelete={setAssetToDelete} />)}
            </TabsContent>
            <TabsContent value="visualizations" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {visualizationAssets.map(asset => <AssetCard key={asset.id} asset={asset} onDelete={setAssetToDelete} />)}
            </TabsContent>
          </Tabs>
        </div>
  
         <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Asset</DialogTitle>
              <DialogDescription>
                Add a new image, document, or chart to your asset library.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-file" className="text-right">File</Label>
                <Input id="asset-file" type="file" ref={fileInputRef} onChange={handleFileSelect} className="col-span-3"/>
            </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-name" className="text-right">Name</Label>
                <Input id="asset-name" value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} className="col-span-3" placeholder="e.g., Summer Workshop Flyer"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-type" className="text-right">Type</Label>
                 <Select value={newAssetType} onValueChange={(value) => setNewAssetType(value as AssetType)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Image">Image</SelectItem>
                      <SelectItem value="Document">Document</SelectItem>
                      <SelectItem value="Chart">Chart</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              {isUploading && <Progress value={uploadProgress} className="col-span-4" />}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
              <Button onClick={handleUploadAsset} disabled={!newAssetFile || isUploading}>
                {isUploading ? "Uploading..." : "Upload Asset"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!assetToDelete} onOpenChange={() => setAssetToDelete(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the asset "{assetToDelete?.name}". This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setAssetToDelete(null)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteAsset}>Delete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    );
}

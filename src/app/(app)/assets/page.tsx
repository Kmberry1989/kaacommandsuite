"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, doc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Download, Share2, Folder, Image as ImageIcon, FileText, BarChart2, PlusCircle, Trash2, MoreVertical, Edit
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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

// --- TYPE DEFINITIONS ---
type AssetType = "Image" | "Document" | "Chart";

type BaseAsset = {
  id: string;
  name: string;
  type: AssetType;
  date: string;
  filePath: string; // Path in Firebase Storage
  downloadURL: string;
};

type ImageAsset = BaseAsset & { type: "Image" };
type DocumentAsset = BaseAsset & { type: "Document", icon: typeof FileText };
type ChartAsset = BaseAsset & { type: "Chart", icon: typeof BarChart2 };

type Asset = ImageAsset | DocumentAsset | ChartAsset;

const AssetCard = ({ asset, onDelete }: { asset: Asset, onDelete: () => void }) => (
  <Card className="overflow-hidden group">
    <CardContent className="p-0 relative">
      {asset.type === "Image" ? (
        <Image
          src={asset.downloadURL}
          alt={asset.name}
          width={400}
          height={300}
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-secondary flex items-center justify-center">
            <asset.icon className="h-16 w-16 text-muted-foreground" />
        </div>
      )}
      <div className="absolute top-2 right-2">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(asset.downloadURL, '_blank')}><Download className="mr-2 h-4 w-4"/>Download</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(asset.downloadURL)}><Share2 className="mr-2 h-4 w-4"/>Copy Link</DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardContent>
    <CardFooter className="flex-col items-start p-4">
        <p className="font-semibold truncate w-full">{asset.name}</p>
        <p className="text-sm text-muted-foreground">
            {new Date(asset.date).toLocaleDateString()}
        </p>
    </CardFooter>
  </Card>
);

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    
    // Upload State
    const [newAssetName, setNewAssetName] = useState("");
    const [newAssetType, setNewAssetType] = useState<AssetType>("Image");
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    
    const { toast } = useToast();
    
    useEffect(() => {
        const unsub = onSnapshot(collection(db, "assets"), (snapshot) => {
            const allAssets = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as BaseAsset)
              .map(asset => {
                  if (asset.type === 'Document') return {...asset, icon: FileText};
                  if (asset.type === 'Chart') return {...asset, icon: BarChart2};
                  return asset;
              }) as Asset[];
            setAssets(allAssets.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        });
        return () => unsub();
    }, []);

    const handleUpload = async () => {
        if (!fileToUpload || !newAssetName) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please provide a name and select a file."});
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        const fileExtension = fileToUpload.name.split('.').pop();
        const filePath = `assets/${newAssetType.toLowerCase()}/${Date.now()}_${newAssetName.replace(/\s+/g, '_')}.${fileExtension}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload the file. Please try again."});
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                await addDoc(collection(db, "assets"), {
                    name: newAssetName,
                    type: newAssetType,
                    date: new Date().toISOString(),
                    filePath,
                    downloadURL
                });

                toast({ title: "Asset Uploaded!", description: `${newAssetName} is now in your library.` });
                
                // Reset state
                setIsUploading(false);
                setUploadDialogOpen(false);
                setNewAssetName("");
                setFileToUpload(null);
                setUploadProgress(0);
            }
        );
    };

    const handleDelete = async () => {
        if (!assetToDelete) return;

        try {
            // Delete file from Firebase Storage
            const fileRef = ref(storage, assetToDelete.filePath);
            await deleteObject(fileRef);

            // Delete document from Firestore
            await deleteDoc(doc(db, "assets", assetToDelete.id));
            
            toast({ title: "Asset Deleted", description: `'${assetToDelete.name}' has been removed.`});
        } catch (error) {
             console.error("Error deleting asset:", error);
             toast({ variant: "destructive", title: "Delete Failed", description: "Could not delete the asset. It may have already been removed." });
        } finally {
            setAssetToDelete(null);
            setDeleteDialogOpen(false);
        }
    }

    const triggerDeleteDialog = (asset: Asset) => {
        setAssetToDelete(asset);
        setDeleteDialogOpen(true);
    };
  
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
              <TabsTrigger value="Image"><ImageIcon className="mr-2 h-4 w-4"/> Images</TabsTrigger>
              <TabsTrigger value="Document"><FileText className="mr-2 h-4 w-4"/> Documents</TabsTrigger>
              <TabsTrigger value="Chart"><BarChart2 className="mr-2 h-4 w-4"/> Charts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {assets.map(asset => <AssetCard key={asset.id} asset={asset} onDelete={() => triggerDeleteDialog(asset)} />)}
            </TabsContent>
            <TabsContent value="Image" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {assets.filter(a => a.type === 'Image').map(asset => <AssetCard key={asset.id} asset={asset} onDelete={() => triggerDeleteDialog(asset)} />)}
            </TabsContent>
            <TabsContent value="Document" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {assets.filter(a => a.type === 'Document').map(asset => <AssetCard key={asset.id} asset={asset} onDelete={() => triggerDeleteDialog(asset)} />)}
            </TabsContent>
            <TabsContent value="Chart" className="grid gap-6 mt-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {assets.filter(a => a.type === 'Chart').map(asset => <AssetCard key={asset.id} asset={asset} onDelete={() => triggerDeleteDialog(asset)} />)}
            </TabsContent>
          </Tabs>
        </div>
  
         <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Asset</DialogTitle>
              <DialogDescription>Add a new file to your asset library.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-name" className="text-right">Name</Label>
                <Input id="asset-name" value={newAssetName} onChange={(e) => setNewAssetName(e.target.value)} className="col-span-3" placeholder="e.g., Summer Workshop Flyer"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-type" className="text-right">Type</Label>
                 <Select value={newAssetType} onValueChange={(value) => setNewAssetType(value as AssetType)}>
                    <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Image">Image</SelectItem>
                      <SelectItem value="Document">Document</SelectItem>
                      <SelectItem value="Chart">Chart/Visualization</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset-file" className="text-right">File</Label>
                <Input id="asset-file" type="file" onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)} className="col-span-3"/>
              </div>
              {isUploading && <Progress value={uploadProgress} className="col-span-4"/>}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary" disabled={isUploading}>Cancel</Button></DialogClose>
              <Button onClick={handleUpload} disabled={isUploading || !fileToUpload || !newAssetName}>
                  {isUploading ? "Uploading..." : "Upload & Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the asset '{assetToDelete?.name}' from your library and storage. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    );
}

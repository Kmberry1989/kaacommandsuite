"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFont, fontMap, FontName } from "@/context/font-provider";

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SettingsDialog({ isOpen, onOpenChange }: SettingsDialogProps) {
  const { font, setFont } = useFont();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize the application's appearance.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="font-select" className="text-right">
              Font
            </Label>
            <Select
              value={font}
              onValueChange={(value: FontName) => setFont(value)}
            >
              <SelectTrigger id="font-select" className="col-span-3">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(fontMap).map((fontName) => (
                  <SelectItem key={fontName} value={fontName}>
                    {fontName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
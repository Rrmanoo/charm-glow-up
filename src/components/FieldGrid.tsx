import { useState, useCallback } from "react";
import { Upload, Check, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

const ZONE_LABELS = [
  "Top Left", "Top Center", "Top Right",
  "Middle Left", "Middle Center", "Middle Right",
  "Bottom Left", "Bottom Center", "Bottom Right",
];

const REQUIRED_IMAGES = 50;

interface ZoneData {
  files: File[];
  previews: string[];
}

interface FieldGridProps {
  onAllZonesFilled?: (zones: ZoneData[]) => void;
}

const FieldGrid = ({ onAllZonesFilled }: FieldGridProps) => {
  const [zones, setZones] = useState<ZoneData[]>(
    Array.from({ length: 9 }, () => ({ files: [], previews: [] }))
  );

  const handleDrop = useCallback(
    (zoneIndex: number, e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const fileList =
        "dataTransfer" in e ? e.dataTransfer.files : e.target.files;
      if (!fileList) return;

      const newFiles = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

      setZones((prev) => {
        const updated = [...prev];
        updated[zoneIndex] = {
          files: [...updated[zoneIndex].files, ...newFiles].slice(0, REQUIRED_IMAGES),
          previews: [...updated[zoneIndex].previews, ...newPreviews].slice(0, REQUIRED_IMAGES),
        };

        const allFilled = updated.every((z) => z.files.length >= REQUIRED_IMAGES);
        if (allFilled) onAllZonesFilled?.(updated);
        return updated;
      });
    },
    [onAllZonesFilled]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Field Zone Upload Grid
        </h3>
        <span className="text-sm text-muted-foreground">
          100 Hectare Field · 9 Zones · {REQUIRED_IMAGES} images each
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {zones.map((zone, i) => {
          const progress = Math.round((zone.files.length / REQUIRED_IMAGES) * 100);
          const isComplete = zone.files.length >= REQUIRED_IMAGES;

          return (
            <motion.label
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(i, e)}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-all min-h-[140px] ${
                isComplete
                  ? "border-success bg-success/5"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleDrop(i, e)}
              />

              {isComplete ? (
                <Check className="h-6 w-6 text-success" />
              ) : zone.files.length > 0 ? (
                <ImageIcon className="h-6 w-6 text-primary" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}

              <span className="mt-2 text-xs font-medium text-foreground">
                Zone {i + 1}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {ZONE_LABELS[i]}
              </span>
              <span className="mt-1 text-xs font-semibold text-muted-foreground">
                {zone.files.length}/{REQUIRED_IMAGES}
              </span>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    isComplete ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.label>
          );
        })}
      </div>
    </div>
  );
};

export default FieldGrid;

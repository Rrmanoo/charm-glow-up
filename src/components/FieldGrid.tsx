import { useState, useCallback, useRef } from "react";
import { Upload, Check, Image as ImageIcon, ChevronDown, ChevronRight, FileArchive, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";

const ZONE_LABELS = [
  "Top Left", "Top Center", "Top Right",
  "Middle Left", "Middle Center", "Middle Right",
  "Bottom Left", "Bottom Center", "Bottom Right",
];

const BLOCK_LABELS = [
  "Top Left", "Top Center", "Top Right",
  "Middle Left", "Middle Center", "Middle Right",
  "Bottom Left", "Bottom Center", "Bottom Right",
];

const MIN_IMAGES_PER_ZONE = 36; // 4 per block × 9 blocks
const MAX_IMAGES_PER_ZONE = 50;
const BLOCKS_PER_ZONE = 9;

interface BlockData {
  files: File[];
  previews: string[];
}

interface ZoneData {
  blocks: BlockData[];
}

const emptyZone = (): ZoneData => ({
  blocks: Array.from({ length: BLOCKS_PER_ZONE }, () => ({ files: [], previews: [] })),
});

const getTotalImages = (zone: ZoneData) =>
  zone.blocks.reduce((sum, b) => sum + b.files.length, 0);

const FieldGrid = () => {
  const [zones, setZones] = useState<ZoneData[]>(
    Array.from({ length: 9 }, emptyZone)
  );
  const [expandedZone, setExpandedZone] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const handleBlockUpload = useCallback(
    (zoneIdx: number, blockIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList) return;

      const newFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

      setZones((prev) => {
        const updated = structuredClone(prev);
        const block = updated[zoneIdx].blocks[blockIdx];
        block.files = [...block.files, ...newFiles];
        block.previews = [...block.previews, ...newPreviews];

        // Trim zone to max
        const total = getTotalImages(updated[zoneIdx]);
        if (total > MAX_IMAGES_PER_ZONE) {
          // Remove excess from this block
          const excess = total - MAX_IMAGES_PER_ZONE;
          block.files = block.files.slice(0, Math.max(0, block.files.length - excess));
          block.previews = block.previews.slice(0, Math.max(0, block.previews.length - excess));
        }
        return updated;
      });
    },
    []
  );

  const removeImage = (zoneIdx: number, blockIdx: number, imgIdx: number) => {
    setZones((prev) => {
      const updated = structuredClone(prev);
      const block = updated[zoneIdx].blocks[blockIdx];
      URL.revokeObjectURL(block.previews[imgIdx]);
      block.files.splice(imgIdx, 1);
      block.previews.splice(imgIdx, 1);
      return updated;
    });
  };

  const handleZipUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const updated = Array.from({ length: 9 }, emptyZone);

      // Parse structure: */zone_N/block_N/image.jpg
      const imageEntries: { zoneIdx: number; blockIdx: number; entry: JSZip.JSZipObject }[] = [];

      zip.forEach((relativePath, entry) => {
        if (entry.dir) return;
        const ext = relativePath.toLowerCase();
        if (!ext.match(/\.(jpg|jpeg|png|webp|bmp|tiff?)$/)) return;

        const parts = relativePath.split("/").filter(Boolean);
        // Find zone_N and block_N in path
        let zoneIdx = -1;
        let blockIdx = -1;

        for (const part of parts) {
          const zoneMatch = part.match(/zone[_\-\s]?(\d+)/i);
          if (zoneMatch) zoneIdx = parseInt(zoneMatch[1]) - 1;
          const blockMatch = part.match(/block[_\-\s]?(\d+)/i);
          if (blockMatch) blockIdx = parseInt(blockMatch[1]) - 1;
        }

        if (zoneIdx >= 0 && zoneIdx < 9 && blockIdx >= 0 && blockIdx < 9) {
          imageEntries.push({ zoneIdx, blockIdx, entry });
        }
      });

      // Process all images in parallel
      await Promise.all(
        imageEntries.map(async ({ zoneIdx, blockIdx, entry }) => {
          const blob = await entry.async("blob");
          const fileName = entry.name.split("/").pop() || "image.jpg";
          const imgFile = new File([blob], fileName, { type: "image/jpeg" });
          const preview = URL.createObjectURL(imgFile);

          const block = updated[zoneIdx].blocks[blockIdx];
          block.files.push(imgFile);
          block.previews.push(preview);
        })
      );

      // Trim each zone to max
      for (const zone of updated) {
        let total = getTotalImages(zone);
        let blockIdx = BLOCKS_PER_ZONE - 1;
        while (total > MAX_IMAGES_PER_ZONE && blockIdx >= 0) {
          const excess = total - MAX_IMAGES_PER_ZONE;
          const block = zone.blocks[blockIdx];
          const toRemove = Math.min(excess, block.files.length);
          block.files = block.files.slice(0, block.files.length - toRemove);
          block.previews = block.previews.slice(0, block.previews.length - toRemove);
          total = getTotalImages(zone);
          blockIdx--;
        }
      }

      setZones(updated);
    } catch (err) {
      console.error("ZIP parse error:", err);
    } finally {
      setUploading(false);
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  }, []);

  const totalImages = zones.reduce((s, z) => s + getTotalImages(z), 0);
  const filledZones = zones.filter((z) => getTotalImages(z) >= MIN_IMAGES_PER_ZONE).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Field Zone Upload Grid
          </h3>
          <span className="text-sm text-muted-foreground">
            9 Zones · 9 Blocks each · {MIN_IMAGES_PER_ZONE}–{MAX_IMAGES_PER_ZONE} images per zone
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {totalImages} images · {filledZones}/9 zones ready
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => zipInputRef.current?.click()}
            disabled={uploading}
          >
            <FileArchive className="mr-2 h-4 w-4" />
            {uploading ? "Reading ZIP..." : "Upload ZIP"}
          </Button>
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            className="sr-only"
            onChange={handleZipUpload}
          />
        </div>
      </div>

      {/* ZIP structure hint */}
      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3">
        <p className="text-xs text-muted-foreground font-mono">
          ZIP structure: field_name/ → zone_1/ → block_1/ → image1.jpg (4 imgs per block × 9 blocks × 9 zones)
        </p>
      </div>

      {/* 3×3 zone grid */}
      <div className="grid grid-cols-3 gap-3">
        {zones.map((zone, zoneIdx) => {
          const total = getTotalImages(zone);
          const isComplete = total >= MIN_IMAGES_PER_ZONE;
          const isExpanded = expandedZone === zoneIdx;
          const filledBlocks = zone.blocks.filter((b) => b.files.length > 0).length;

          return (
            <motion.div
              key={zoneIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: zoneIdx * 0.04 }}
              className={`rounded-xl border-2 transition-all overflow-hidden ${
                isComplete
                  ? "border-success bg-success/5"
                  : total > 0
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <button
                onClick={() => setExpandedZone(isExpanded ? null : zoneIdx)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <Check className="h-4 w-4 text-success shrink-0" />
                  ) : total > 0 ? (
                    <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-foreground">Zone {zoneIdx + 1}</p>
                    <p className="text-[10px] text-muted-foreground">{ZONE_LABELS[zoneIdx]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-bold text-muted-foreground">{total}/{MIN_IMAGES_PER_ZONE}</p>
                    <p className="text-[9px] text-muted-foreground">{filledBlocks}/9 blocks</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Progress bar */}
              <div className="mx-3 mb-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    isComplete ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(100, (total / MIN_IMAGES_PER_ZONE) * 100)}%` }}
                />
              </div>

              {total > 0 && total < MIN_IMAGES_PER_ZONE && (
                <div className="mx-3 mb-2 flex items-center gap-1 text-[10px] text-warning">
                  <AlertCircle className="h-3 w-3" />
                  Need {MIN_IMAGES_PER_ZONE - total} more images
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Expanded zone detail */}
      <AnimatePresence>
        {expandedZone !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Zone {expandedZone + 1} — {ZONE_LABELS[expandedZone]}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {getTotalImages(zones[expandedZone])} images · Upload 4 images per block
                  </p>
                </div>
                <button
                  onClick={() => setExpandedZone(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 3×3 block grid */}
              <div className="grid grid-cols-3 gap-2">
                {zones[expandedZone].blocks.map((block, blockIdx) => {
                  const hasImages = block.files.length > 0;
                  return (
                    <div
                      key={blockIdx}
                      className={`rounded-lg border p-2 transition-all ${
                        block.files.length >= 4
                          ? "border-success/50 bg-success/5"
                          : hasImages
                          ? "border-primary/30 bg-primary/5"
                          : "border-dashed border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold text-foreground">
                          B{blockIdx + 1} · {BLOCK_LABELS[blockIdx]}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          {block.files.length} imgs
                        </span>
                      </div>

                      {/* Image thumbnails */}
                      {hasImages && (
                        <div className="grid grid-cols-2 gap-0.5 mb-1.5 rounded overflow-hidden">
                          {block.previews.slice(0, 4).map((preview, imgIdx) => (
                            <div key={imgIdx} className="relative group">
                              <img
                                src={preview}
                                alt=""
                                className="w-full aspect-square object-cover"
                              />
                              <button
                                onClick={() => removeImage(expandedZone, blockIdx, imgIdx)}
                                className="absolute top-0 right-0 rounded-bl bg-destructive/80 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-2.5 w-2.5 text-white" />
                              </button>
                            </div>
                          ))}
                          {block.files.length > 4 && (
                            <div className="col-span-2 text-center text-[9px] text-muted-foreground py-0.5">
                              +{block.files.length - 4} more
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload button */}
                      <label className="flex items-center justify-center gap-1 cursor-pointer rounded bg-muted/50 py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Upload className="h-3 w-3" />
                        {hasImages ? "Add more" : "Upload"}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleBlockUpload(expandedZone, blockIdx, e)}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FieldGrid;

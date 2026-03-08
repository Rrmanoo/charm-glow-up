import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, Percent, Leaf, TrendingUp, ZoomIn } from "lucide-react";

const FIELD_IMAGES = Array.from({ length: 8 }, (_, i) => `/field-images/img-${i + 1}.jpg`);

// Seeded pseudo-random to keep layout stable across renders
function seededShuffle(seed: number, count: number): number[] {
  const arr: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    arr.push(s % FIELD_IMAGES.length);
  }
  return arr;
}

interface ZoneSpecies {
  name: string;
  percentage: number;
}

interface ZoneData {
  zone: number;
  infestation: number;
  weedCount: number;
  dominantWeed: string;
  species: ZoneSpecies[];
  heatmapCells: number[];
}

const mockZones: ZoneData[] = [
  { zone: 1, infestation: 12, weedCount: 34, dominantWeed: "Amaranthus",
    species: [{ name: "Amaranthus retroflexus", percentage: 52 }, { name: "Digitaria sanguinalis", percentage: 30 }, { name: "Portulaca oleracea", percentage: 18 }],
    heatmapCells: [5, 15, 8, 20, 10, 5, 12, 18, 6] },
  { zone: 2, infestation: 28, weedCount: 89, dominantWeed: "Cyperus",
    species: [{ name: "Cyperus rotundus", percentage: 45 }, { name: "Echinochloa crus-galli", percentage: 35 }, { name: "Amaranthus retroflexus", percentage: 20 }],
    heatmapCells: [25, 30, 20, 35, 40, 28, 15, 22, 30] },
  { zone: 3, infestation: 8, weedCount: 22, dominantWeed: "Digitaria",
    species: [{ name: "Digitaria sanguinalis", percentage: 60 }, { name: "Portulaca oleracea", percentage: 40 }],
    heatmapCells: [3, 8, 5, 10, 12, 6, 4, 9, 7] },
  { zone: 4, infestation: 35, weedCount: 112, dominantWeed: "Amaranthus",
    species: [{ name: "Amaranthus retroflexus", percentage: 48 }, { name: "Cyperus rotundus", percentage: 30 }, { name: "Echinochloa crus-galli", percentage: 22 }],
    heatmapCells: [30, 40, 35, 45, 50, 38, 25, 30, 28] },
  { zone: 5, infestation: 22, weedCount: 67, dominantWeed: "Echinochloa",
    species: [{ name: "Echinochloa crus-galli", percentage: 42 }, { name: "Amaranthus retroflexus", percentage: 33 }, { name: "Cyperus rotundus", percentage: 25 }],
    heatmapCells: [18, 22, 25, 20, 30, 22, 15, 18, 20] },
  { zone: 6, infestation: 18, weedCount: 51, dominantWeed: "Cyperus",
    species: [{ name: "Cyperus rotundus", percentage: 50 }, { name: "Digitaria sanguinalis", percentage: 30 }, { name: "Portulaca oleracea", percentage: 20 }],
    heatmapCells: [12, 18, 20, 15, 25, 18, 10, 15, 22] },
  { zone: 7, infestation: 42, weedCount: 138, dominantWeed: "Amaranthus",
    species: [{ name: "Amaranthus retroflexus", percentage: 55 }, { name: "Echinochloa crus-galli", percentage: 25 }, { name: "Cyperus rotundus", percentage: 20 }],
    heatmapCells: [40, 50, 45, 55, 60, 48, 35, 42, 38] },
  { zone: 8, infestation: 15, weedCount: 43, dominantWeed: "Digitaria",
    species: [{ name: "Digitaria sanguinalis", percentage: 45 }, { name: "Portulaca oleracea", percentage: 35 }, { name: "Amaranthus retroflexus", percentage: 20 }],
    heatmapCells: [10, 15, 12, 18, 20, 15, 8, 12, 14] },
  { zone: 9, infestation: 9, weedCount: 25, dominantWeed: "Echinochloa",
    species: [{ name: "Echinochloa crus-galli", percentage: 55 }, { name: "Digitaria sanguinalis", percentage: 45 }],
    heatmapCells: [4, 8, 6, 10, 14, 8, 5, 9, 7] },
];

const ZONE_LABELS = [
  "Top Left", "Top Center", "Top Right",
  "Middle Left", "Middle Center", "Middle Right",
  "Bottom Left", "Bottom Center", "Bottom Right",
];

const getSeverityColor = (rate: number) => {
  if (rate > 35) return "text-destructive";
  if (rate > 20) return "text-warning";
  return "text-success";
};

const getBorderColor = (rate: number) => {
  if (rate > 35) return "border-destructive/60";
  if (rate > 20) return "border-warning/60";
  return "border-success/60";
};

const getHeatColor = (intensity: number) => {
  if (intensity > 40) return "bg-destructive/70";
  if (intensity > 25) return "bg-warning/60";
  if (intensity > 10) return "bg-accent/40";
  return "bg-success/30";
};

const FieldImageReconstruction = () => {
  const mostInfested = mockZones.reduce((max, z) => z.infestation > max.infestation ? z : max, mockZones[0]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(mostInfested);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Generate stable image indices: 9 zones × 9 blocks × 4 images = 324
  const imageMap = useMemo(() => seededShuffle(42, 9 * 9 * 4), []);

  const getImageForCell = (zoneIdx: number, blockIdx: number, imgIdx: number) => {
    const flatIndex = zoneIdx * 36 + blockIdx * 4 + imgIdx;
    return FIELD_IMAGES[imageMap[flatIndex]];
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Field Reconstruction — Image Mosaic View
      </h3>
      <p className="text-xs text-muted-foreground -mt-2">
        324 field images across 9 zones · 9 blocks per zone · 4 images per block · Click zone to inspect
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Image mosaic grid */}
        <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border shadow-elevated bg-card">
          <div className="grid grid-cols-3 gap-[2px] p-[2px]">
            {mockZones.map((z, zoneIdx) => {
              const isSelected = selectedZone?.zone === z.zone;
              return (
                <motion.button
                  key={zoneIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + zoneIdx * 0.05 }}
                  onClick={() => setSelectedZone(isSelected ? null : z)}
                  className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${getBorderColor(z.infestation)} ${
                    isSelected ? "ring-2 ring-primary z-10 border-2" : "border hover:ring-1 hover:ring-primary/50"
                  }`}
                >
                  {/* 3x3 block grid inside zone */}
                  <div className="grid grid-cols-3 gap-[1px]">
                    {Array.from({ length: 9 }, (_, blockIdx) => (
                      <div key={blockIdx} className="grid grid-cols-2 gap-[0.5px]">
                        {Array.from({ length: 4 }, (_, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={getImageForCell(zoneIdx, blockIdx, imgIdx)}
                            alt=""
                            className="w-full aspect-square object-cover"
                            draggable={false}
                            loading="lazy"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  {/* Zone label overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 transition-opacity hover:bg-black/20">
                    <span className="text-[10px] font-bold text-white drop-shadow-md">Z{z.zone}</span>
                    <span className="text-sm sm:text-base font-extrabold text-white drop-shadow-md">{z.infestation}%</span>
                    <span className="text-[9px] font-medium text-white/90 drop-shadow-md">{z.weedCount} weeds</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selectedZone ? (
            <motion.div
              key={selectedZone.zone}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="rounded-xl border bg-card p-5 shadow-card self-start"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-bold text-foreground">Zone {selectedZone.zone}</h4>
                  <span className="text-xs text-muted-foreground">{ZONE_LABELS[selectedZone.zone - 1]}</span>
                </div>
                <button onClick={() => setSelectedZone(null)} className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-bold text-foreground">{selectedZone.weedCount}</p>
                    <p className="text-[10px] text-muted-foreground">total weeds</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <p className={`text-sm font-bold ${getSeverityColor(selectedZone.infestation)}`}>{selectedZone.infestation}%</p>
                    <p className="text-[10px] text-muted-foreground">infested</p>
                  </div>
                </div>
              </div>

              {/* Sample images from this zone */}
              <div className="mb-4">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <ZoomIn className="h-3 w-3" /> Sample Images
                </p>
                <div className="grid grid-cols-4 gap-1 rounded-lg overflow-hidden">
                  {Array.from({ length: 8 }, (_, i) => {
                    const src = getImageForCell(selectedZone.zone - 1, i, 0);
                    return (
                      <img
                        key={i}
                        src={src}
                        alt=""
                        className="w-full aspect-square object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => { e.stopPropagation(); setZoomedImage(src); }}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Density Distribution
                </p>
                <div className="grid grid-cols-3 gap-0.5 rounded-lg overflow-hidden">
                  {selectedZone.heatmapCells.map((cell, i) => (
                    <div key={i} className={`h-6 ${getHeatColor(cell)} flex items-center justify-center`}>
                      <span className="text-[8px] font-bold text-foreground/70">{cell}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Leaf className="h-3 w-3" /> Species Breakdown
                </p>
                <div className="space-y-2">
                  {selectedZone.species.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-foreground italic truncate max-w-[65%]">{s.name}</span>
                        <span className="text-xs font-bold text-muted-foreground">{s.percentage}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.percentage}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full rounded-full bg-primary/70"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center rounded-xl border border-dashed bg-card/50 p-8 text-center self-start min-h-[200px]"
            >
              <p className="text-sm text-muted-foreground">
                Click a zone on the mosaic to view its detailed analysis
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zoomed image modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setZoomedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              src={zoomedImage}
              alt="Zoomed field image"
              className="max-w-full max-h-[85vh] rounded-xl object-contain"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 rounded-full bg-card p-2 text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FieldImageReconstruction;

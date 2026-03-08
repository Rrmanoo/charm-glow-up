import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, Percent, Leaf, TrendingUp } from "lucide-react";
import satelliteImg from "@/assets/satellite-field.jpg";

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

const getColor = (rate: number) => {
  if (rate > 35) return "bg-destructive/60 border-destructive";
  if (rate > 20) return "bg-warning/50 border-warning";
  return "bg-success/40 border-success";
};

const getSeverityColor = (rate: number) => {
  if (rate > 35) return "text-destructive";
  if (rate > 20) return "text-warning";
  return "text-success";
};

const getHeatColor = (intensity: number) => {
  if (intensity > 40) return "bg-destructive/70";
  if (intensity > 25) return "bg-warning/60";
  if (intensity > 10) return "bg-accent/40";
  return "bg-success/30";
};

const FieldOverlay = () => {
  const mostInfested = mockZones.reduce((max, z) => z.infestation > max.infestation ? z : max, mockZones[0]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(mostInfested);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Field Reconstruction — Weed Distribution Map
      </h3>
      <p className="text-xs text-muted-foreground -mt-2">Click any zone to view detailed analysis</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Map */}
        <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border shadow-elevated">
          <img
            src={satelliteImg}
            alt="Satellite view of field"
            className="block w-full object-cover"
          />
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 p-[5%]">
            {mockZones.map((z, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => setSelectedZone(selectedZone?.zone === z.zone ? null : z)}
                className={`relative flex flex-col items-center justify-center rounded-lg border-2 backdrop-blur-sm cursor-pointer transition-all overflow-hidden ${getColor(z.infestation)} ${
                  selectedZone?.zone === z.zone ? "ring-2 ring-primary ring-offset-1 scale-[1.03]" : "hover:scale-[1.02]"
                }`}
              >
                {/* Mini heatmap background */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                  {z.heatmapCells.map((cell, ci) => (
                    <div key={ci} className={getHeatColor(cell)} />
                  ))}
                </div>
                {/* Labels */}
                <span className="relative text-xs font-bold text-foreground drop-shadow-sm">Z{z.zone}</span>
                <span className="relative text-lg font-extrabold text-foreground drop-shadow-sm">{z.infestation}%</span>
                <span className="relative text-[10px] font-medium text-foreground/80 drop-shadow-sm">{z.weedCount} weeds</span>
              </motion.button>
            ))}
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

              {/* Stats */}
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

              {/* Mini heatmap */}
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

              {/* Species */}
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
                Click a zone on the map to view its detailed analysis
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-success/50 border border-success" />
          Low (&lt;20%)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-warning/50 border border-warning" />
          Medium (20-35%)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-destructive/50 border border-destructive" />
          High (&gt;35%)
        </div>
      </div>
    </div>
  );
};

export default FieldOverlay;

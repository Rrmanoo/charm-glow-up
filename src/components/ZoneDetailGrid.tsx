import { motion } from "framer-motion";
import { Hash, Percent, Leaf, TrendingUp } from "lucide-react";

const ZONE_LABELS = [
  "Top Left", "Top Center", "Top Right",
  "Middle Left", "Middle Center", "Middle Right",
  "Bottom Left", "Bottom Center", "Bottom Right",
];

interface ZoneSpecies {
  name: string;
  percentage: number;
}

interface ZoneDetail {
  zone: number;
  weedCount: number;
  infestation: number;
  dominantWeed: string;
  species: ZoneSpecies[];
  thumbnails: string[];
  heatmapCells: number[]; // 9 cells (3x3) with intensity 0-100
}

const mockZoneDetails: ZoneDetail[] = [
  {
    zone: 1, weedCount: 34, infestation: 12, dominantWeed: "Amaranthus",
    species: [{ name: "Amaranthus retroflexus", percentage: 52 }, { name: "Digitaria sanguinalis", percentage: 30 }, { name: "Portulaca oleracea", percentage: 18 }],
    thumbnails: [],
    heatmapCells: [5, 15, 8, 20, 10, 5, 12, 18, 6],
  },
  {
    zone: 2, weedCount: 89, infestation: 28, dominantWeed: "Cyperus",
    species: [{ name: "Cyperus rotundus", percentage: 45 }, { name: "Echinochloa crus-galli", percentage: 35 }, { name: "Amaranthus retroflexus", percentage: 20 }],
    thumbnails: [],
    heatmapCells: [25, 30, 20, 35, 40, 28, 15, 22, 30],
  },
  {
    zone: 3, weedCount: 22, infestation: 8, dominantWeed: "Digitaria",
    species: [{ name: "Digitaria sanguinalis", percentage: 60 }, { name: "Portulaca oleracea", percentage: 40 }],
    thumbnails: [],
    heatmapCells: [3, 8, 5, 10, 12, 6, 4, 9, 7],
  },
  {
    zone: 4, weedCount: 112, infestation: 35, dominantWeed: "Amaranthus",
    species: [{ name: "Amaranthus retroflexus", percentage: 48 }, { name: "Cyperus rotundus", percentage: 30 }, { name: "Echinochloa crus-galli", percentage: 22 }],
    thumbnails: [],
    heatmapCells: [30, 40, 35, 45, 50, 38, 25, 30, 28],
  },
  {
    zone: 5, weedCount: 67, infestation: 22, dominantWeed: "Echinochloa",
    species: [{ name: "Echinochloa crus-galli", percentage: 42 }, { name: "Amaranthus retroflexus", percentage: 33 }, { name: "Cyperus rotundus", percentage: 25 }],
    thumbnails: [],
    heatmapCells: [18, 22, 25, 20, 30, 22, 15, 18, 20],
  },
  {
    zone: 6, weedCount: 51, infestation: 18, dominantWeed: "Cyperus",
    species: [{ name: "Cyperus rotundus", percentage: 50 }, { name: "Digitaria sanguinalis", percentage: 30 }, { name: "Portulaca oleracea", percentage: 20 }],
    thumbnails: [],
    heatmapCells: [12, 18, 20, 15, 25, 18, 10, 15, 22],
  },
  {
    zone: 7, weedCount: 138, infestation: 42, dominantWeed: "Amaranthus",
    species: [{ name: "Amaranthus retroflexus", percentage: 55 }, { name: "Echinochloa crus-galli", percentage: 25 }, { name: "Cyperus rotundus", percentage: 20 }],
    thumbnails: [],
    heatmapCells: [40, 50, 45, 55, 60, 48, 35, 42, 38],
  },
  {
    zone: 8, weedCount: 43, infestation: 15, dominantWeed: "Digitaria",
    species: [{ name: "Digitaria sanguinalis", percentage: 45 }, { name: "Portulaca oleracea", percentage: 35 }, { name: "Amaranthus retroflexus", percentage: 20 }],
    thumbnails: [],
    heatmapCells: [10, 15, 12, 18, 20, 15, 8, 12, 14],
  },
  {
    zone: 9, weedCount: 25, infestation: 9, dominantWeed: "Echinochloa",
    species: [{ name: "Echinochloa crus-galli", percentage: 55 }, { name: "Digitaria sanguinalis", percentage: 45 }],
    thumbnails: [],
    heatmapCells: [4, 8, 6, 10, 14, 8, 5, 9, 7],
  },
];

const getSeverityColor = (rate: number) => {
  if (rate > 35) return "text-destructive";
  if (rate > 20) return "text-warning";
  return "text-success";
};

const getSeverityBg = (rate: number) => {
  if (rate > 35) return "bg-destructive/15 border-destructive/25";
  if (rate > 20) return "bg-warning/15 border-warning/25";
  return "bg-success/15 border-success/25";
};

const getHeatColor = (intensity: number) => {
  if (intensity > 40) return "bg-destructive/70";
  if (intensity > 25) return "bg-warning/60";
  if (intensity > 10) return "bg-accent/40";
  return "bg-success/30";
};

const ZoneDetailCard = ({ zone, index }: { zone: ZoneDetail; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className={`rounded-xl border p-4 shadow-card ${getSeverityBg(zone.infestation)}`}
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-3">
      <div>
        <h4 className="text-sm font-bold text-foreground">Zone {zone.zone}</h4>
        <span className="text-[10px] text-muted-foreground">{ZONE_LABELS[zone.zone - 1]}</span>
      </div>
      <div className={`text-lg font-extrabold ${getSeverityColor(zone.infestation)}`}>
        {zone.infestation}%
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="flex items-center gap-1.5 rounded-lg bg-background/60 px-2 py-1.5">
        <Hash className="h-3 w-3 text-muted-foreground" />
        <div>
          <p className="text-xs font-bold text-foreground">{zone.weedCount}</p>
          <p className="text-[9px] text-muted-foreground">weeds</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-background/60 px-2 py-1.5">
        <Percent className="h-3 w-3 text-muted-foreground" />
        <div>
          <p className="text-xs font-bold text-foreground">{zone.infestation}%</p>
          <p className="text-[9px] text-muted-foreground">infested</p>
        </div>
      </div>
    </div>

    {/* Mini heatmap */}
    <div className="mb-3">
      <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
        <TrendingUp className="h-2.5 w-2.5" />
        Density Map
      </p>
      <div className="grid grid-cols-3 gap-0.5 rounded-md overflow-hidden">
        {zone.heatmapCells.map((cell, i) => (
          <div
            key={i}
            className={`h-4 ${getHeatColor(cell)} transition-colors`}
            title={`${cell}% density`}
          />
        ))}
      </div>
    </div>

    {/* Species breakdown */}
    <div>
      <p className="text-[10px] font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
        <Leaf className="h-2.5 w-2.5" />
        Species
      </p>
      <div className="space-y-1.5">
        {zone.species.map((s) => (
          <div key={s.name}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-foreground italic truncate max-w-[70%]">
                {s.name}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">{s.percentage}%</span>
            </div>
            <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70 transition-all"
                style={{ width: `${s.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const ZoneDetailGrid = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-foreground">
      Zone-by-Zone Analysis
    </h3>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mockZoneDetails.map((zone, i) => (
        <ZoneDetailCard key={zone.zone} zone={zone} index={i} />
      ))}
    </div>

    {/* Legend */}
    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
      <div className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm bg-success/40" />
        Low (&lt;20%)
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm bg-warning/50" />
        Medium (20-35%)
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm bg-destructive/50" />
        High (&gt;35%)
      </div>
    </div>
  </div>
);

export default ZoneDetailGrid;

import { motion } from "framer-motion";
import satelliteImg from "@/assets/satellite-field.jpg";

interface ZoneOverlay {
  zone: number;
  infestation: number;
  weedCount: number;
  dominantWeed: string;
}

const mockZones: ZoneOverlay[] = [
  { zone: 1, infestation: 12, weedCount: 34, dominantWeed: "Amaranthus" },
  { zone: 2, infestation: 28, weedCount: 89, dominantWeed: "Cyperus" },
  { zone: 3, infestation: 8, weedCount: 22, dominantWeed: "Digitaria" },
  { zone: 4, infestation: 35, weedCount: 112, dominantWeed: "Amaranthus" },
  { zone: 5, infestation: 22, weedCount: 67, dominantWeed: "Echinochloa" },
  { zone: 6, infestation: 18, weedCount: 51, dominantWeed: "Cyperus" },
  { zone: 7, infestation: 42, weedCount: 138, dominantWeed: "Amaranthus" },
  { zone: 8, infestation: 15, weedCount: 43, dominantWeed: "Digitaria" },
  { zone: 9, infestation: 9, weedCount: 25, dominantWeed: "Echinochloa" },
];

const getColor = (rate: number) => {
  if (rate > 35) return "bg-destructive/60 border-destructive";
  if (rate > 20) return "bg-warning/50 border-warning";
  return "bg-success/40 border-success";
};

const FieldOverlay = () => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-foreground">
      Field Reconstruction — Weed Distribution Map
    </h3>

    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border shadow-elevated">
      <img
        src={satelliteImg}
        alt="Satellite view of field"
        className="block w-full object-cover"
      />

      {/* Overlay grid */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 p-[5%]">
        {mockZones.map((z, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`flex flex-col items-center justify-center rounded-lg border-2 backdrop-blur-sm ${getColor(
              z.infestation
            )}`}
          >
            <span className="text-xs font-bold text-foreground drop-shadow-sm">
              Z{z.zone}
            </span>
            <span className="text-lg font-extrabold text-foreground drop-shadow-sm">
              {z.infestation}%
            </span>
            <span className="text-[10px] font-medium text-foreground/80 drop-shadow-sm">
              {z.weedCount} weeds
            </span>
          </motion.div>
        ))}
      </div>
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

export default FieldOverlay;

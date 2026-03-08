import { motion } from "framer-motion";
import { FlaskConical, Shield, Clock, Droplets, AlertTriangle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TreatmentInfo {
  commonName: string;
  herbicides: string[];
  culturalControl: string;
  timing: string;
  severity: "low" | "moderate" | "high";
}

const TREATMENT_DB: Record<string, TreatmentInfo> = {
  "Portulaca oleracea": {
    commonName: "Common Purslane",
    herbicides: ["Pendimethalin (pre-emergent)", "Dicamba (post-emergent)", "2,4-D amine"],
    culturalControl: "Maintain dense crop canopy; mulch heavily; hand-pull before seed set. Avoid tilling when mature plants present as stem fragments can re-root.",
    timing: "Apply pre-emergent before soil temps reach 15°C. Post-emergent most effective on seedlings < 5cm.",
    severity: "low",
  },
  "Amaranthus retroflexus": {
    commonName: "Redroot Pigweed",
    herbicides: ["Atrazine (pre/post)", "Metribuzin (pre-emergent)", "Glyphosate (non-selective)", "Fomesafen (post-emergent)"],
    culturalControl: "Rotate crops with competitive cover crops (rye, clover). Prevent seed rain — a single plant can produce 100,000+ seeds.",
    timing: "Pre-emergent at planting. Post-emergent before plants exceed 10cm height for best efficacy.",
    severity: "high",
  },
  "Cyperus rotundus": {
    commonName: "Purple Nutsedge",
    herbicides: ["Halosulfuron-methyl (Sedgehammer)", "Sulfentrazone (pre-emergent)", "Imazapyr (non-selective)"],
    culturalControl: "Repeated cultivation to exhaust tubers (6–8 cycles). Solarization with clear plastic for 4–6 weeks in summer. Do NOT compost tubers.",
    timing: "Post-emergent at 3–5 leaf stage. Repeat applications often necessary due to tuber regrowth.",
    severity: "high",
  },
  "Echinochloa crus-galli": {
    commonName: "Barnyardgrass",
    herbicides: ["Propanil (post-emergent)", "Quinclorac", "Fenoxaprop-P-ethyl", "Pendimethalin (pre-emergent)"],
    culturalControl: "Maintain flooded paddy conditions (3–5cm) in rice. Use competitive crop varieties. Stale seedbed technique effective.",
    timing: "Pre-emergent within 3 days of planting. Post-emergent before 3-tiller stage.",
    severity: "moderate",
  },
  "Digitaria sanguinalis": {
    commonName: "Large Crabgrass",
    herbicides: ["Dithiopyr (pre-emergent)", "Quinclorac (post-emergent)", "Fenoxaprop-P-ethyl"],
    culturalControl: "Maintain dense turf/crop stand. Mow at proper height. Avoid bare soil patches — crabgrass thrives in thin, open areas.",
    timing: "Pre-emergent when soil temps reach 13°C for 3 consecutive days. Post-emergent on young plants only.",
    severity: "moderate",
  },
  "Chenopodium album": {
    commonName: "Lambsquarters",
    herbicides: ["Atrazine", "Metribuzin", "Bromoxynil (post-emergent)", "Linuron"],
    culturalControl: "Competitive crop canopy closure. Seeds remain viable 20+ years — prevent seed production at all costs.",
    timing: "Post-emergent before 10cm. Pre-emergent at planting for season-long control.",
    severity: "moderate",
  },
  "Convolvulus arvensis": {
    commonName: "Field Bindweed",
    herbicides: ["Glyphosate (systemic, repeat apps)", "Quinclorac", "Aminopyralid"],
    culturalControl: "Deep, repeated tillage to fragment roots (but fragments can resprout). Competitive alfalfa planting. Multi-year management plan required.",
    timing: "Post-emergent at full bloom for maximum translocation to roots. Fall applications most effective.",
    severity: "high",
  },
  "Setaria viridis": {
    commonName: "Green Foxtail",
    herbicides: ["Sethoxydim (post-emergent)", "Fluazifop-P-butyl", "S-metolachlor (pre-emergent)"],
    culturalControl: "Rotate with broadleaf crops to use grass-specific herbicides. Delayed planting allows stale seedbed approach.",
    timing: "Post-emergent at 2–4 leaf stage. Pre-emergent before crop emergence.",
    severity: "low",
  },
  "Sorghum halepense": {
    commonName: "Johnsongrass",
    herbicides: ["Nicosulfuron (post-emergent)", "Clethodim", "Glyphosate (spot treatment)"],
    culturalControl: "Deep moldboard plowing to bury rhizomes > 15cm. Repeated mowing weakens rhizome reserves over time.",
    timing: "Post-emergent when 30–45cm tall. Multiple applications needed for rhizome control.",
    severity: "high",
  },
  "Cirsium arvense": {
    commonName: "Canada Thistle",
    herbicides: ["Clopyralid (selective)", "Aminopyralid", "Glyphosate (spot)", "MCPA + Dicamba"],
    culturalControl: "Competitive cover crops. Repeated mowing every 21 days exhausts root reserves over 2–3 seasons. Biological control with Rhinocyllus weevils.",
    timing: "Post-emergent at rosette to early bolt stage. Fall applications target root reserves.",
    severity: "high",
  },
};

const severityConfig = {
  low: { label: "Low Threat", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  moderate: { label: "Moderate Threat", className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  high: { label: "High Threat", className: "bg-red-500/15 text-red-700 border-red-500/30" },
};

interface TreatmentRecommendationsProps {
  species: { name: string; count: number; percentage: number }[];
}

const TreatmentRecommendations = ({ species }: TreatmentRecommendationsProps) => {
  if (!species.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-5 shadow-card"
    >
      <div className="mb-4 flex items-center gap-2">
        <FlaskConical className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Treatment Recommendations</h3>
      </div>

      <Accordion type="multiple" className="w-full">
        {species.map((s) => {
          const treatment = TREATMENT_DB[s.name];
          if (!treatment) {
            return (
              <AccordionItem key={s.name} value={s.name}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="italic text-foreground">{s.name}</span>
                    <span className="rounded-full border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      No data
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs text-muted-foreground">
                    No treatment data available for this species. Consult a local agronomist for recommendations.
                  </p>
                </AccordionContent>
              </AccordionItem>
            );
          }

          const sev = severityConfig[treatment.severity];

          return (
            <AccordionItem key={s.name} value={s.name}>
              <AccordionTrigger className="text-sm hover:no-underline">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="italic text-foreground">{s.name}</span>
                  <span className="text-[11px] text-muted-foreground">({treatment.commonName})</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sev.className}`}>
                    {sev.label}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-1">
                  {/* Herbicides */}
                  <div className="flex gap-2">
                    <Droplets className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Chemical Control</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {treatment.herbicides.map((h) => (
                          <span
                            key={h}
                            className="rounded-md border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cultural control */}
                  <div className="flex gap-2">
                    <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Cultural / Mechanical Control</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{treatment.culturalControl}</p>
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="flex gap-2">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">Application Timing</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{treatment.timing}</p>
                    </div>
                  </div>

                  {/* Warning */}
                  {treatment.severity === "high" && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2.5">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                      <p className="text-[11px] leading-relaxed text-red-700">
                        High-threat species — aggressive spreader. Multi-season management strategy recommended. Consult local extension services.
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </motion.div>
  );
};

export default TreatmentRecommendations;

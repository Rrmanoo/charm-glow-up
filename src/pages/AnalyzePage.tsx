import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, Bug, Percent, Hash, Leaf, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import weedSampleImg from "@/assets/weed-sample.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

interface AnalysisResult {
  weedCount: number;
  infestationRate: number;
  species: { name: string; count: number; percentage: number }[];
  boundingBoxes?: BoundingBox[];
  summary?: string;
}

const BBOX_COLORS = [
  "rgba(239, 68, 68, 0.85)",   // red
  "rgba(234, 179, 8, 0.85)",   // yellow
  "rgba(59, 130, 246, 0.85)",  // blue
  "rgba(168, 85, 247, 0.85)",  // purple
  "rgba(34, 197, 94, 0.85)",   // green
  "rgba(249, 115, 22, 0.85)",  // orange
];

const getSpeciesColor = (label: string, allLabels: string[]) => {
  const uniqueLabels = [...new Set(allLabels)];
  const idx = uniqueLabels.indexOf(label);
  return BBOX_COLORS[idx % BBOX_COLORS.length];
};

const mockResult: AnalysisResult = {
  weedCount: 2,
  infestationRate: 8.5,
  species: [
    { name: "Portulaca oleracea", count: 2, percentage: 100 },
  ],
  boundingBoxes: [
    { x: 0.25, y: 0.3, width: 0.22, height: 0.25, label: "Portulaca oleracea", confidence: 0.92 },
    { x: 0.55, y: 0.5, width: 0.2, height: 0.22, label: "Portulaca oleracea", confidence: 0.87 },
  ],
  summary: "Two specimens of Common Purslane (Portulaca oleracea) detected on bare soil. The plant displays characteristic succulent, spatula-shaped leaves arranged in a rosette pattern. Low infestation rate with localized growth.",
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const BoundingBoxOverlay = ({ boxes, showBoxes }: { boxes: BoundingBox[]; showBoxes: boolean }) => {
  if (!showBoxes || !boxes.length) return null;
  const allLabels = boxes.map((b) => b.label);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {boxes.map((box, i) => {
        const color = getSpeciesColor(box.label, allLabels);
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="absolute"
            style={{
              left: `${box.x * 100}%`,
              top: `${box.y * 100}%`,
              width: `${box.width * 100}%`,
              height: `${box.height * 100}%`,
            }}
          >
            {/* Box border */}
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                border: `2px solid ${color}`,
                boxShadow: `0 0 8px ${color.replace("0.85", "0.4")}`,
              }}
            />
            {/* Label tag */}
            <div
              className="absolute -top-5 left-0 flex items-center gap-1 rounded-t-sm px-1.5 py-0.5 text-[9px] font-bold text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              <span className="truncate max-w-[100px]">{box.label}</span>
              <span className="opacity-80">{Math.round(box.confidence * 100)}%</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const AnalyzePage = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isExample, setIsExample] = useState(false);
  const [showBoxes, setShowBoxes] = useState(true);

  const showExample = () => {
    setImage(weedSampleImg);
    setIsExample(true);
    setResult(mockResult);
    setShowBoxes(true);
  };

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
      e.preventDefault();
      const file =
        "dataTransfer" in e
          ? e.dataTransfer.files[0]
          : e.target.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      setImage(URL.createObjectURL(file));
      setImageFile(file);
      setResult(null);
      setIsExample(false);
      setShowBoxes(true);
    },
    []
  );

  const runAnalysis = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    try {
      const imageBase64 = await fileToBase64(imageFile);
      const { data, error } = await supabase.functions.invoke("classify-weed", {
        body: { imageBase64 },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data as AnalysisResult);
      setShowBoxes(true);
      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error("Analysis failed:", err);
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">
            Single Image Analysis
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload a field image to identify and count weeds with AI-powered classification and bounding box detection
          </p>
          {!image && !result && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={showExample}
            >
              <Leaf className="mr-2 h-4 w-4" />
              See Example Output
            </Button>
          )}
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Upload area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {!image ? (
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleUpload}
                className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleUpload}
                />
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">
                  Drop image or click to upload
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG up to 20MB
                </p>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border shadow-card">
                  <img
                    src={image}
                    alt="Uploaded field"
                    className="w-full object-cover"
                  />
                  {result?.boundingBoxes && (
                    <BoundingBoxOverlay boxes={result.boundingBoxes} showBoxes={showBoxes} />
                  )}
                </div>
                <div className="flex gap-3">
                  {!isExample && (
                    <Button
                      onClick={runAnalysis}
                      disabled={analyzing}
                      className="flex-1 bg-gradient-hero text-primary-foreground font-semibold"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Bug className="mr-2 h-4 w-4" />
                          Detect Weeds
                        </>
                      )}
                    </Button>
                  )}
                  {result?.boundingBoxes && result.boundingBoxes.length > 0 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowBoxes(!showBoxes)}
                      title={showBoxes ? "Hide bounding boxes" : "Show bounding boxes"}
                    >
                      {showBoxes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImage(null);
                      setImageFile(null);
                      setResult(null);
                      setIsExample(false);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Results */}
          <div>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {isExample && (
                    <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent-foreground">
                      <AlertCircle className="h-3.5 w-3.5" />
                      This is example data. Upload your own image for real AI analysis.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      icon={Hash}
                      label="Weed Count"
                      value={result.weedCount}
                      sub="detected in image"
                      variant="warning"
                    />
                    <StatCard
                      icon={Percent}
                      label="Infestation Rate"
                      value={`${result.infestationRate}%`}
                      sub="of visible area"
                      variant={
                        result.infestationRate > 30
                          ? "destructive"
                          : result.infestationRate > 15
                          ? "warning"
                          : "success"
                      }
                    />
                  </div>

                  {/* Bounding box legend */}
                  {result.boundingBoxes && result.boundingBoxes.length > 0 && (
                    <div className="rounded-xl border bg-card p-4 shadow-card">
                      <h3 className="mb-2 text-sm font-semibold text-foreground">
                        Detections ({result.boundingBoxes.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.boundingBoxes.map((box, i) => {
                          const allLabels = result.boundingBoxes!.map((b) => b.label);
                          const color = getSpeciesColor(box.label, allLabels);
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-white"
                              style={{ backgroundColor: color }}
                            >
                              <span className="truncate max-w-[120px]">{box.label}</span>
                              <span className="opacity-80">{Math.round(box.confidence * 100)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {result.summary && (
                    <div className="rounded-xl border bg-card p-4 shadow-card">
                      <p className="text-sm text-muted-foreground">{result.summary}</p>
                    </div>
                  )}

                  <div className="rounded-xl border bg-card p-5 shadow-card">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">
                      Species Identified
                    </h3>
                    <div className="space-y-3">
                      {result.species.map((s) => (
                        <div key={s.name} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <Leaf className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground italic">
                                {s.name}
                              </span>
                              <span className="text-xs font-semibold text-muted-foreground">
                                {s.count} ({s.percentage}%)
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${s.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center shadow-card"
                >
                  <img
                    src={weedSampleImg}
                    alt="Weed sample"
                    className="mb-4 h-28 w-28 rounded-xl object-cover opacity-60"
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload an image and click "Detect Weeds" to see AI-powered analysis with bounding boxes
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzePage;

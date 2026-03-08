import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Loader2, Bug, Percent, Hash, Leaf, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import weedSampleImg from "@/assets/weed-sample.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  weedCount: number;
  infestationRate: number;
  species: { name: string; count: number; percentage: number }[];
  summary?: string;
}

const mockResult: AnalysisResult = {
  weedCount: 47,
  infestationRate: 23.5,
  species: [
    { name: "Amaranthus retroflexus", count: 18, percentage: 38 },
    { name: "Cyperus rotundus", count: 12, percentage: 26 },
    { name: "Echinochloa crus-galli", count: 9, percentage: 19 },
    { name: "Digitaria sanguinalis", count: 5, percentage: 11 },
    { name: "Other species", count: 3, percentage: 6 },
  ],
  summary: "Example output — upload your own image for real AI analysis.",
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]); // strip data:...;base64,
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const AnalyzePage = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isExample, setIsExample] = useState(false);

  const showExample = () => {
    setImage(weedSampleImg);
    setIsExample(true);
    setResult(mockResult);
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
            Upload a field image to identify and count weeds with AI-powered classification
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
                <div className="overflow-hidden rounded-2xl border shadow-card">
                  <img
                    src={image}
                    alt="Uploaded field"
                    className="w-full object-cover"
                  />
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

                  {result.summary && !isExample && (
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
                    Upload an image and click "Detect Weeds" to see AI-powered analysis results
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

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FieldGrid from "@/components/FieldGrid";
import FieldOverlay from "@/components/FieldOverlay";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import StatCard from "@/components/StatCard";
import { Hash, Percent, Bug, Leaf } from "lucide-react";

const FieldPage = () => {
  const [location, setLocation] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleProcess = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setShowResults(true);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">
            Field Analysis
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload images from all 9 zones of your 100-hectare field for complete weed mapping
          </p>
        </motion.div>

        {/* Location input */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-card sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Field Location
            </label>
            <Input
              placeholder="Enter GPS coordinates or address..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-background"
            />
          </div>
          <Button variant="outline" className="shrink-0" disabled={!location}>
            <Search className="mr-2 h-4 w-4" />
            Locate Field
          </Button>
        </motion.div>

        {/* Upload Grid */}
        <div className="mt-8">
          <FieldGrid />
        </div>

        {/* Process button */}
        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={handleProcess}
            disabled={processing}
            className="bg-gradient-hero text-primary-foreground font-semibold px-10"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Field Data...
              </>
            ) : (
              <>
                <Bug className="mr-2 h-4 w-4" />
                Analyze All Zones
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-10"
          >
            {/* Summary stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Hash} label="Total Weeds" value="581" sub="across all zones" variant="warning" />
              <StatCard icon={Percent} label="Avg Infestation" value="21.0%" sub="field average" variant="warning" />
              <StatCard icon={Bug} label="Species Found" value="5" sub="unique species" variant="default" />
              <StatCard icon={Leaf} label="Most Affected" value="Zone 7" sub="42% infestation" variant="destructive" />
            </div>

            {/* Field overlay */}
            <FieldOverlay />

            {/* Analytics */}
            <AnalyticsPanel />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FieldPage;

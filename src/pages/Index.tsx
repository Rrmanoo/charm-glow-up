import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Grid3X3, Leaf, Sprout, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-field.jpg";

const features = [
  {
    icon: Target,
    title: "Single Image Analysis",
    desc: "Upload a photo and instantly get weed count, species classification, and infestation rate.",
  },
  {
    icon: Grid3X3,
    title: "Full Field Reconstruction",
    desc: "Divide your 100ha field into 9 zones, upload 50 images each, and get a complete weed map.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Detailed charts showing infestation rates, weed species distribution, and zone comparisons.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Agricultural field aerial view"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="mb-4 flex items-center gap-2">
              <Sprout className="h-5 w-5 text-accent" />
              <span className="text-sm font-semibold uppercase tracking-wider text-accent">
                Precision Agriculture
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Identify & Map
              <br />
              <span className="text-accent">Field Weeds</span> Instantly
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              AI-powered weed detection for your crops. Upload field images, get
              species classification, infestation rates, and a full
              reconstructed weed map of your 100-hectare field.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-accent text-accent-foreground font-semibold shadow-elevated hover:opacity-90 transition-opacity">
                <Link to="/analyze">
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze Image
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/field">
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  Field Analysis
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground">
            From a single photo to a complete field weed map
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group rounded-2xl border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-primary">
                Learn more
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Leaf className="h-4 w-4" />
            <span className="text-sm">
              WeedScan — AI-Powered Weed Identification
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

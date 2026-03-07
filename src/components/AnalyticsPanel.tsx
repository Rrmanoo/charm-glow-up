import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const zoneData = [
  { zone: "Z1", infestation: 12 },
  { zone: "Z2", infestation: 28 },
  { zone: "Z3", infestation: 8 },
  { zone: "Z4", infestation: 35 },
  { zone: "Z5", infestation: 22 },
  { zone: "Z6", infestation: 18 },
  { zone: "Z7", infestation: 42 },
  { zone: "Z8", infestation: 15 },
  { zone: "Z9", infestation: 9 },
];

const weedTypes = [
  { name: "Amaranthus", value: 35, color: "hsl(0, 65%, 50%)" },
  { name: "Cyperus", value: 25, color: "hsl(30, 80%, 50%)" },
  { name: "Echinochloa", value: 20, color: "hsl(45, 90%, 50%)" },
  { name: "Digitaria", value: 12, color: "hsl(145, 50%, 40%)" },
  { name: "Other", value: 8, color: "hsl(200, 40%, 50%)" },
];

const AnalyticsPanel = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="space-y-6"
  >
    <h3 className="text-lg font-semibold text-foreground">Analytics Dashboard</h3>

    <div className="grid gap-6 lg:grid-cols-2">
      {/* Bar chart */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h4 className="mb-4 text-sm font-medium text-muted-foreground">
          Infestation Rate by Zone (%)
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={zoneData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40 20% 88%)" />
            <XAxis dataKey="zone" tick={{ fontSize: 12 }} stroke="hsl(25 15% 45%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(25 15% 45%)" />
            <Tooltip
              contentStyle={{
                background: "hsl(40 33% 97%)",
                border: "1px solid hsl(40 20% 88%)",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
            <Bar dataKey="infestation" fill="hsl(145 45% 28%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <h4 className="mb-4 text-sm font-medium text-muted-foreground">
          Weed Species Distribution
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={weedTypes}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {weedTypes.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(40 33% 97%)",
                border: "1px solid hsl(40 20% 88%)",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {weedTypes.map((w) => (
            <div key={w.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: w.color }}
              />
              {w.name} ({w.value}%)
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

export default AnalyticsPanel;

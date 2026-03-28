"use client";

/**
 * Re-export recharts components via dynamic import.
 * Usage: import { BarChart, Bar, ... } from "@/components/charts";
 *
 * Recharts (~200Ko) est code-splitté dans un chunk séparé,
 * chargé uniquement quand un composant chart est rendu.
 */
export {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie,
} from "recharts";

// Chart.js configuration utility to avoid duplicate registrations
// This ensures Chart.js is only registered once across the app

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler,
} from "chart.js";

let chartRegistered = false;

export function registerChartJS() {
  if (!chartRegistered) {
    ChartJS.register(
      ArcElement,
      CategoryScale,
      LinearScale,
      BarElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      PointElement,
      Filler
    );
    chartRegistered = true;
  }
}


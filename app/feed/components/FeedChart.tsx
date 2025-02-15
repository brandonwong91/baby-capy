"use client";

import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type FeedChartProps = {
  feeds: Array<{
    feedTime: string;
    amount: number;
  }>;
  selectedDate: Date;
  highestVolumeLastWeek: {
    amount: number;
    date: string;
  };
  lowestVolumeLastWeek: {
    amount: number;
    date: string;
  };
};

export function FeedChart({
  feeds,
  selectedDate,
  highestVolumeLastWeek,
  lowestVolumeLastWeek,
}: FeedChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Daily Feeding Chart</h2>
      <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
        <div>
          <p className="text-sm text-gray-600">Highest Volume (Last 7 Days)</p>
          <p className="text-lg font-semibold text-pink-600">
            {highestVolumeLastWeek ? (
              <>
                {highestVolumeLastWeek.amount} ml
                <span className="text-sm text-gray-500 ml-2">
                  {highestVolumeLastWeek.date}
                </span>
              </>
            ) : (
              "No data available"
            )}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Lowest Volume (Last 7 Days)</p>
          <p className="text-lg font-semibold text-blue-600">
            {lowestVolumeLastWeek ? (
              <>
                {lowestVolumeLastWeek.amount} ml
                <span className="text-sm text-gray-500 ml-2">
                  {lowestVolumeLastWeek.date}
                </span>
              </>
            ) : (
              "No data available"
            )}
          </p>
        </div>
      </div>
      <Line
        data={{
          labels: feeds.map((feed) => format(new Date(feed.feedTime), "HH:mm")),
          datasets: [
            {
              label: "Milk Amount (ml)",
              data: feeds.map((feed) => feed.amount),
              borderColor: "#FF8BA7",
              backgroundColor: "rgba(255, 139, 167, 0.2)",
              tension: 0.4,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: "top" as const,
            },
            title: {
              display: true,
              text: `Feeding Pattern - ${format(selectedDate, "MMM dd, yyyy")}`,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Amount (ml)",
              },
            },
          },
        }}
      />
    </div>
  );
}

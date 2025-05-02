"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import preSurveyData from "../../../data/pre-survey.json";

type PreSurveyData = {
  persona_name: string;
  normalized_vaccine_rating: number;
}

type SupportCategory = "supportive" | "neutral" | "unsupportive";

type CategoryCount = {
  name: SupportCategory;
  value: number;
  personas: string[];
}

type PieChartProps = {
  className?: string;
  dataSource?: "mixed" | "fake" | "real" | "all";
}

export const VaccinePieChart = ({ className, dataSource = "all" }: PieChartProps) => {
  // Group the data into categories
  const categorizeData = () => {
    const categories: Record<SupportCategory, CategoryCount> = {
      supportive: { name: "supportive", value: 0, personas: [] },
      neutral: { name: "neutral", value: 0, personas: [] },
      unsupportive: { name: "unsupportive", value: 0, personas: [] }
    };

    preSurveyData.forEach((persona: PreSurveyData) => {
      const rating = persona.normalized_vaccine_rating;
      if (rating < 0.5) {
        categories.unsupportive.value += 1;
        categories.unsupportive.personas.push(persona.persona_name);
      } else if (rating === 0.5) {
        categories.neutral.value += 1;
        categories.neutral.personas.push(persona.persona_name);
      } else { // rating > 0.5
        categories.supportive.value += 1;
        categories.supportive.personas.push(persona.persona_name);
      }
    });

    // Convert to array for Recharts
    return Object.values(categories).filter(category => category.value > 0);
  };

  const data = categorizeData();
  
  // Custom colors for each category
  const COLORS = {
    supportive: "#4ade80",    // Green-400
    neutral: "#9ca3af",       // Gray-400
    unsupportive: "#f87171"   // Red-400
  };

  // Custom tooltip to show personas in each category
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, personas } = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded shadow-md border border-gray-200">
          <p className="font-medium">{name.charAt(0).toUpperCase() + name.slice(1)}: {value} personas</p>
          <ul className="text-sm mt-1">
            {personas.map((persona: string) => (
              <li key={persona}>{persona}</li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">Initial Stance on Vaccines</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.name as SupportCategory]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: 20 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

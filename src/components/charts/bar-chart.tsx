'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { PersonaData } from '@/lib/data';
import { THRESHOLD, NORMALIZED_THRESHOLD } from '@/lib/constants';

interface FinalRatingsByPersonaProps {
  data: PersonaData[];
  className?: string;
}

interface ChartDataItem {
  name: string;
  rating: number;
  formattedRating: string;
  isAboveThreshold: boolean;
  aboveThresholdRating?: number;
  belowThresholdRating?: number;
}

// Helper function to get the final rating for each persona
const getFinalRatingsData = (data: PersonaData[]) => {
  // Group by persona and find the highest iteration for each
  const personaMap = new Map<string, PersonaData>();
  
  data.forEach((item) => {
    const currentPersona = personaMap.get(item.persona_name);
    
    // If we don't have this persona yet, or this iteration is higher than what we have
    if (!currentPersona || item.iteration > currentPersona.iteration) {
      personaMap.set(item.persona_name, item);
    }
  });
  
  // Convert to array and sort by normalized_current_rating for better visualization
  return Array.from(personaMap.values())
    .map(item => {
      const isAboveThreshold = item.normalized_current_rating >= NORMALIZED_THRESHOLD;
      return {
        name: item.persona_name,
        rating: item.normalized_current_rating,
        // Format for display (0-100% with one decimal place)
        formattedRating: `${(item.normalized_current_rating * 100).toFixed(1)}%`,
        // We'll use these to color the bars
        isAboveThreshold,
        // Split the rating into two separate values for the two bars
        aboveThresholdRating: isAboveThreshold ? item.normalized_current_rating : 0,
        belowThresholdRating: !isAboveThreshold ? item.normalized_current_rating : 0
      };
    })
    .sort((a, b) => b.rating - a.rating); // Sort from highest to lowest rating
};

export function FinalRatingsByPersona({ data, className }: FinalRatingsByPersonaProps) {
  const chartData = getFinalRatingsData(data);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Get the data from whichever payload item has a value
      const dataItem = payload.find((p: any) => p.value > 0);
      if (!dataItem) return null;
      
      const data = dataItem.payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold text-sm">{data.name}</p>
          <p className="text-sm mt-1">Final Rating: {data.formattedRating}</p>
          <p className="text-sm mt-1 text-gray-500">
            {data.isAboveThreshold ? 
              'Above vaccination threshold' : 
              'Below vaccination threshold'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <h2 className="text-xl font-bold mb-4">Final COVID-19 Vaccination Ratings</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
          >
            <defs>
              <linearGradient id="greenGradient" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#86efac" />
              </linearGradient>
              <linearGradient id="redGradient" x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#fca5a5" />
              </linearGradient>
            </defs>
            <XAxis 
              type="number" 
              domain={[0, 1]} 
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 14 }}
              width={70}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: 20 }} />
            <Bar 
              dataKey="aboveThresholdRating" 
              name="Take the vaccine" 
              fill="url(#greenGradient)"
              radius={[4, 4, 4, 4]}
              stackId="stack"
              label={{ 
                position: 'right', 
                formatter: (value: number) => value > 0 ? `${(value * 100).toFixed(1)}%` : '',
                fill: '#1f2937',
                fontSize: 12
              }}
            />
            <Bar 
              dataKey="belowThresholdRating" 
              name="Refuse the vaccine" 
              fill="url(#redGradient)"
              radius={[4, 4, 4, 4]}
              stackId="stack"
              label={{ 
                position: 'right', 
                formatter: (value: number) => value > 0 ? `${(value * 100).toFixed(1)}%` : '',
                fill: '#1f2937',
                fontSize: 12
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
}

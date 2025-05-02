'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PersonaData, getAvailablePersonas } from '@/lib/data';

export interface NewsImpactAnalysisProps {
  className?: string;
  data: PersonaData[];
}

export function NewsImpactAnalysis({ className, data }: NewsImpactAnalysisProps) {
  const availablePersonas = getAvailablePersonas();

  // Calculate impact data - average rating per iteration
  const impactData = useMemo(() => {
    // Initialize result object
    const result = {
      totalExposureCount: data.length,
      averageChangePerIteration: 0,
      ratingsByIteration: [] as any[],
    };

    // Calculate total change across all personas
    let totalChange = 0;
    let personaCount = 0;

    // Group data by persona
    const personaProgress: Record<string, PersonaData[]> = {};

    // Initialize persona records
    availablePersonas.forEach(persona => {
      personaProgress[persona] = [];
    });

    // Group data by persona
    data.forEach(item => {
      personaProgress[item.persona_name].push(item);
    });

    // Process each persona's progress
    Object.entries(personaProgress).forEach(([persona, personaData]) => {
      // Sort by iteration
      const sortedData = [...personaData].sort((a, b) => a.iteration - b.iteration);

      // Calculate total change
      if (sortedData.length > 1) {
        const change = sortedData[sortedData.length - 1].normalized_current_rating - sortedData[0].normalized_current_rating;
        totalChange += change;
        personaCount++;
      }
    });

    // Calculate average change per iteration
    if (personaCount > 0) {
      result.averageChangePerIteration = totalChange / personaCount;
    }

    // Calculate average ratings per iteration
    const maxIteration = data.length > 0 ? Math.max(...data.map(item => item.iteration)) : 0;
    
    for (let i = 1; i <= maxIteration; i++) {
      const iterationData = {
        iteration: i,
        avgRating: 0,
        count: 0,
        cumulativeChange: 0
      };

      // Calculate average rating for this iteration
      const items = data.filter(item => item.iteration === i);

      if (items.length > 0) {
        iterationData.avgRating = items.reduce((sum, item) => sum + item.normalized_current_rating, 0) / items.length;
        iterationData.count = items.length;
      }

      // Calculate cumulative change
      if (i === 1) {
        iterationData.cumulativeChange = iterationData.avgRating;
      } else {
        const prevData = result.ratingsByIteration[i - 2];
        iterationData.cumulativeChange = prevData.cumulativeChange +
          (items.length > 0 ? iterationData.avgRating - prevData.avgRating : 0);
      }

      result.ratingsByIteration.push(iterationData);
    }

    return result;
  }, [availablePersonas, data]);

  const ImpactTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold text-sm">Iteration {label}</p>
          <div className="mt-2">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center mb-1">
                <div
                  className="w-3 h-3 mr-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}: </span>
                <span className="text-sm ml-1">{Number(entry.value).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-xl font-bold">News Impact Analysis</h2>
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-sm mb-2">News Exposure Overview</h3>
            <div className="p-3 bg-white rounded-md shadow-sm">
              <p className="text-xs text-gray-600">Total News Exposures</p>
              <p className="text-2xl font-bold">{impactData.totalExposureCount}</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-sm mb-2">Average Attitude Change</h3>
            <div className="p-3 bg-white rounded-md shadow-sm">
              <p className="text-xs text-gray-600">Overall Impact</p>
              <p className={`text-2xl font-bold ${impactData.averageChangePerIteration >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {impactData.averageChangePerIteration >= 0 ? '+' : ''}
                {impactData.averageChangePerIteration.toFixed(3)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={impactData.ratingsByIteration}
              margin={{ top: 20, right: 40, left: 30, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="iteration"
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 0.25, 0.5, 0.75, 1]}
                tickFormatter={(value) => value.toFixed(2)}
                label={{ value: 'Average Rating', angle: -90, position: 'insideBottomLeft' }}
                tick={{ fontSize: 12 }}
                axisLine={false}
              />
              <Tooltip content={<ImpactTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 10 }} 
                iconType="circle"
                iconSize={10}
              />

              <Line
                type="monotone"
                dataKey="avgRating"
                name="Average Rating"
                stroke="#60a5fa"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 
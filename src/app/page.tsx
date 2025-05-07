"use client";

import { FinalRatingsByPersona } from "@/components/charts/bar-chart";
import { RatingTable } from "@/components/charts/iteration-table";
import { NewsImpactAnalysis } from "@/components/charts/news-impact-analysis";
import { VaccinePieChart } from "@/components/charts/pie-chart";
import { ConversionTrajectory } from "@/components/insights/converstion-trajectory";
import { mixedNewsPersonaData, fakeNewsPersonaData, realNewsPersonaData, PersonaData } from "@/lib/data";
import { QuickInsights } from "@/components/insights/quick-insights";
import { SimpleRatingChart } from "@/components/charts/simple-rating-chart";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { AIComparisionButton } from "@/components/ai-comparision-button";

export default function RootPage() {
  const [personaData, setPersonaData] = useState<PersonaData[]>(mixedNewsPersonaData);
  const [selectedDataset, setSelectedDataset] = useState<string>("Mixed News");

  const handlePersonaChange = (personaName: string) => {
    if (personaName === "Mixed News") {
      setPersonaData(mixedNewsPersonaData);
    } else if (personaName === "Fake News") {
      setPersonaData(fakeNewsPersonaData);
    } else if (personaName === "Real News") {
      setPersonaData(realNewsPersonaData);
    }
  };

  const handleDatasetChange = (value: string) => {
    setSelectedDataset(value);
    handlePersonaChange(value);
  };

  // Map selected dataset to pie chart data source
  const getDataSource = (): "mixed" | "fake" | "real" | "all" => {
    switch (selectedDataset) {
      case "Mixed News": return "mixed";
      case "Fake News": return "fake";
      case "Real News": return "real";
      default: return "all";
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      {/* Header with title only */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-b from-sky-400 via-sky-600 to-sky-800 text-transparent bg-clip-text">HealthByte Data Dashboard</h1>
      </div>

      {/* Combined row with personas link and dataset selection */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 md:gap-0">
        <div className="flex items-center gap-3 w-full md:w-auto">

          {/* hardcoded link to persona 'David'*/}
          <Link href="/chat/107">
            <AIComparisionButton title="Chat with Persona" />
          </Link>
          <Link href="/personas" className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 text-md hover:bg-blue-100 hover:text-blue-800 transition">View Personas</Link>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <span className="text-sm font-medium">Select Dataset:</span>
          <Select value={selectedDataset} onValueChange={handleDatasetChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mixed News">Mixed News</SelectItem>
              <SelectItem value="Fake News">Fake News</SelectItem>
              <SelectItem value="Real News">Real News</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <QuickInsights className="mb-12" data={personaData} />
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <SimpleRatingChart data={personaData} className="w-full" />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md md:w-3/5 w-full">
            <ConversionTrajectory data={personaData} className="w-full" />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md md:w-2/5 w-full">
            <VaccinePieChart dataSource={getDataSource()} className="w-full" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <NewsImpactAnalysis data={personaData} className="w-full" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
          <FinalRatingsByPersona data={personaData} className="w-full" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <RatingTable data={personaData} className="w-full" />
        </div>
      </div>
    </main>
  );
}

import React from "react"

export default function PersonasLoading() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        <h1 className="text-3xl font-bold">Personas</h1>
        <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>

      <div className="w-full md:w-1/2 mb-8 h-10 bg-gray-200 rounded-lg animate-pulse"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="bg-white rounded-lg shadow-md p-5"
          >
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mr-4"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
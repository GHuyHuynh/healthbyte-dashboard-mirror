"use client"
import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import personasData from "../../../data/personas.json"
import femaleImage from "../../../public/female avatar.png"
import maleImage from "../../../public/male avatar.png"

export default function PersonaListPage() {
  const [search, setSearch] = useState("")
  

  const filtered = personasData.filter((p) =>
    [p.name, p.demographics.location, p.personality.archetype]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Personas</h1>
        <Link
          href="/"
          className="px-3 py-1 rounded-md bg-blue-50 text-black hover:bg-blue-100 hover:text-black transition"
        >
          ← Dashboard
        </Link>
      </div>

      <input
        type="search"
        placeholder="Search by name, location or personality…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2 mb-8 border border-gray-300 rounded-lg px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((persona) => (
          <Link
            key={persona.persona_id}
            href={`/persona/${persona.persona_id}`}
            className="block bg-white rounded-lg shadow-md p-5 transform transition duration-200 hover:shadow-lg hover:scale-105"
          >
            <div className="flex items-center mb-4">
              <div className="relative w-16 h-16 flex-shrink-0 mr-4">
                <Image
                  src={
                  persona.demographics.gender === "Female"
                    ? femaleImage
                    : maleImage
                  }
                  alt={`${persona.name} avatar`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{persona.name}</h2>
                <p className="text-sm text-gray-500">
                  {persona.demographics.location}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-2">
              Age {persona.demographics.age},{" "}
              {persona.personality.archetype}
            </p>
            <p className="text-gray-700 line-clamp-3">
              {persona.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
} 
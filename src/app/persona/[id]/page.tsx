import React from "react"
import Link from "next/link"
import Image from "next/image"
import personasData from "../../../../data/personas.json"
import femaleImage from "../../../../public/female avatar.png"
import maleImage from "../../../../public/male avatar.png"
import { AIComparisionButton } from "@/components/ai-comparision-button"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const personaId = parseInt(id, 10)
  const persona = personasData.find(p => p.persona_id === personaId)


  if (!persona) {
    return (
      <main className="container mx-auto p-8">
        <p className="text-red-500">Persona not found.</p>
        <div className="mt-4">
          <Link href="/personas" className="text-blue-600 hover:underline">
            ← Back to Personas
          </Link>
        </div>
      </main>
    )
  }

  const avatarSrc =
    persona.demographics.gender === "Female" ? femaleImage : maleImage

  return (
    <main className="container mx-auto py-8 px-4 space-y-8">
      {/* NAV */}
      <nav className="flex space-x-4 mb-4">
        <Link
          href="/personas"
          className="px-3 py-1 rounded-md bg-blue-50 text-gray-800 hover:bg-blue-100 transition"
        >
          ← Personas
        </Link>
        <Link
          href="/"
          className="px-3 py-1 rounded-md bg-blue-50 text-gray-800 hover:bg-gray-100 transition"
        >
          Dashboard
        </Link>
      </nav>

      {/* HERO CARD */}
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center transform transition duration-200 hover:shadow-lg hover:scale-105">
        <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
          <Image
            src={avatarSrc}
            alt={`${persona.name} avatar`}
            fill
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{persona.name}</h1>
        <p className="mt-2 text-gray-500 text-center max-w-prose">
          {persona.description}
        </p>
      
          <div className="mt-4">
            <Link href={`/chat/${persona.persona_id}`}>
              <AIComparisionButton title={`Chat with ${persona.name}`}/>
            </Link>
          </div>
      </div>

      {/* SIDE-BY-SIDE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demographics as Table */}
        <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition duration-200 hover:shadow-lg hover:scale-105">
          <h2 className="text-2xl font-semibold text-gray-900 mb-9">
            Demographics
          </h2>

          <table className="w-full table-auto border-collapse">
            <tbody>
              {[
                ["Age", persona.demographics.age],
                ["Gender", persona.demographics.gender],
                ["Location", persona.demographics.location],
                ["Occupation", persona.demographics.occupation],
                ["Education", persona.demographics.education],
              ].map(([label, value]) => (
                <tr key={label} className="border-b last:border-0 border-gray-200">
                  <th className="px-4 py-2 text-gray-600 font-medium text-left align-middle">
                    {label}
                  </th>
                  <td className="px-4 py-2 text-gray-900 align-middle">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </section>

        {/* Beliefs & Concerns */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition duration-200 hover:shadow-lg hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Beliefs & Attitudes
            </h2>
            <p className="text-gray-900">
              <span className="font-medium">
                {persona.beliefs_and_attitudes.initial_stance}
              </span>
              : {persona.beliefs_and_attitudes.stance_description}
            </p>
            <p className="mt-2 text-gray-900">
              <span className="font-medium">Key Motivator</span>:{" "}
              {persona.beliefs_and_attitudes.key_motivator}
            </p>
          </section>
          <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition duration-200 hover:shadow-lg hover:scale-105">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Concerns
            </h2>
            <ul className="list-disc list-inside space-y-1 text-gray-900">
              {persona.beliefs_and_attitudes.concerns.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* PERSONALITY (FULL WIDTH) */}
      <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition duration-200 hover:shadow-lg hover:scale-105">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Personality
        </h2>
        <p className="text-gray-900">
          <span className="font-medium">{persona.personality.archetype}</span>:{" "}
          {persona.personality.notes}
        </p>
      </section>
    </main>
  )
}
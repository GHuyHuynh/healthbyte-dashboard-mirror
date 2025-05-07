import Chat from "@/components/chat"
import personasData from "@/lib/data/personas.json"
import { notFound } from "next/navigation"

interface Props {
  params: { id: string }
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const personaId = parseInt(id, 10)
  const persona = personasData.find(p => p.persona_id === personaId)

  // ‣ If we didn’t find a matching persona, render 404
  if (!persona) {
    notFound()
  }
  
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] flex-col overflow-hidden pb-10">
      <Chat persona={persona} />
    </div>
  )
}
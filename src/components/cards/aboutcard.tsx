import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type Persona } from "@/components/chat"

interface AboutCardProps {
  persona: Persona
}

export default function AboutCard({ persona }: AboutCardProps) {
  //extracting first name 
  const displayName = persona.name.split(' ')[0]

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Conversation Comparison</CardTitle>
          <CardDescription>
            A conversation comparison tool for the AI profile of {displayName}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground/90 leading-normal prose">
          <p className="mb-3">
            Compare the before and after exposing to news about COVID-19 vaccines for{' '}
            <strong>{displayName}</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 
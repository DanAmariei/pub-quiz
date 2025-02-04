'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { importQuizzes } from "../_actions"
import { toast } from "sonner"

export default function ImportQuizzesPage() {
  const [isImporting, setIsImporting] = useState(false)
  const [status, setStatus] = useState<{
    total: number
    processed: number
    success: number
    errors: string[]
  }>({
    total: 0,
    processed: 0,
    success: 0,
    errors: []
  })

  const handleImport = async () => {
    setIsImporting(true)
    setStatus(prev => ({ ...prev, errors: [] }))

    try {
      const result = await importQuizzes()
      setStatus(result)
      
      if (result.success > 0) {
        toast.success(`Import finalizat cu succes! ${result.success} quiz-uri importate.`)
      }
      
      if (result.errors.length > 0) {
        toast.error(`Au apărut ${result.errors.length} erori în timpul importului.`)
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        errors: [...prev.errors, 'Eroare la import: ' + error.message]
      }))
      toast.error('Eroare la import: ' + error.message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <main className="flex-1 container py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Import Quiz-uri</h1>
          <p className="text-muted-foreground mt-2">
            Importă quiz-uri din fișierul JSON local
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? "Se importă..." : "Începe Import"}
            </Button>

            {status.total > 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progres:</span>
                    <span>{status.processed} din {status.total}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ 
                        width: `${(status.processed / status.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <p>Quiz-uri importate cu succes: {status.success}</p>
                  {status.errors.length > 0 && (
                    <div className="text-destructive">
                      <p>Erori ({status.errors.length}):</p>
                      <ul className="list-disc pl-4">
                        {status.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
} 
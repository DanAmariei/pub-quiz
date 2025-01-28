import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4">
      <h1 className="text-2xl font-bold">Joc Negăsit</h1>
      <p className="text-muted-foreground">
        Jocul pe care îl cauți nu există sau a fost șters.
      </p>
      <Button asChild>
        <Link href="/games">
          Înapoi la Jocuri
        </Link>
      </Button>
    </div>
  )
} 
import { IIIFIcon } from "@/components/iiif-icon"
import { Link } from "wouter"

export const AppHeader = () => {

  return (
    <div>
      <IIIFIcon />
      <nav>
        <Link href="/sources">1. Select Sources</Link>
        <Link href="/reconstruction">2. Compose</Link>
        <Link href="/preview">3. Preview and Export</Link>
      </nav>
    </div>
  )

}
import "@/app/globals.css"
import { ModalRoot } from "@/components/modals/modal-root"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ModalRoot /> {/* always mounted */}
      </body>
    </html>
  )
}

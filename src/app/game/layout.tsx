'use client'
import "@/app/globals.css"
import { ModalRoot } from "@/components/modals/modal-root"
import { myStore } from "@/store/store"
import { Provider } from "jotai"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <body>
        <Provider store={myStore}>
          {children}
          <ModalRoot /> {/* always mounted */}
        </Provider>
      </body>
  )
}

"use client"

import { useAtom } from "jotai"
import { modalAtom } from "@/store/atoms/modal"
import { WordModal } from "@/components/modals/word-modal"
import { DrawerSelectingModal } from "@/components/modals/drawer-selecting"
import { GameEndedModal } from "./game-ended"

export const ModalRoot = () => {
  const [modal, setModal] = useAtom(modalAtom)

  if (!modal) return null

  const handleClose = () => setModal(null)

  switch (modal.type) {
    case "wordSelect":
      return (
        <WordModal
          words={modal.props.words}
          timer={modal.props.timer}
        />
      )

    case "drawerSelect":
      return (
        <DrawerSelectingModal
          isOpen={true}
          username={modal.props.username}
          timer={modal.props.timer}
          onClose={handleClose}
        />
      )
    case "gameEnded":
      return (
        <GameEndedModal {...modal.props} />
      )

    default:
      return null
  }
}

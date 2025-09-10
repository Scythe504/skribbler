import { Separator } from "@/components/ui/separator"

export function GameFooter() {
  return (
    <div className="text-center text-sm text-muted-foreground space-y-2">
      <Separator className="my-6" />
      <p>
        Need help? Check out our{" "}
        <a href="#" className="text-primary hover:underline">
          game rules
        </a>{" "}
        or{" "}
        <a href="#" className="text-primary hover:underline">
          contact support
        </a>
      </p>
      <p className="text-xs">© 2024 DrawGuess. Made with ❤️ for creative minds.</p>
    </div>
  )
}

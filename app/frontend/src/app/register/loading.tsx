import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-8 left-8">
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="w-full max-w-md">
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    </div>
  )
}


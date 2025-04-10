import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Skeleton className="h-6 w-24" />
      </header>

      <main className="flex-1 container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-8">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="mb-8">
          <Skeleton className="h-10 w-64" />
        </div>

        <div className="mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full mt-2" />
        </div>

        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1">
            <Skeleton className="h-1 rounded-l-full" />
            <Skeleton className="h-1" />
            <Skeleton className="h-1 rounded-r-full" />
          </div>
        </div>

        <Skeleton className="h-[500px] w-full rounded-xl" />
      </main>
    </div>
  )
}


import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Skeleton className="h-6 w-24" />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </nav>
      </header>
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-64 mx-auto mb-8" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </main>
      <footer className="border-t py-6 px-4 lg:px-6">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-4 sm:gap-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </footer>
    </div>
  )
}


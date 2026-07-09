import { Card, CardHeader } from "./card"
import { Skeleton } from "./skeleton"

export function FoodCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-40 w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-5 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
    </Card>
  )
}

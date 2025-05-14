import type React from "react"
import { BentoGrid, BentoGridItem } from "./bento-grid"

// Define the type for an item
interface Item {
  title: string
  description: string
  header?: React.ReactNode // Optional header
}

// Define the props interface
interface BentoGridDemoProps {
  items: Item[] // Array of items to be passed as props
}

export function BentoGridDemo({ items }: BentoGridDemoProps) {
  return (
    <BentoGrid className="max-w-4xl mx-auto">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header || <Skeleton />} // Use Skeleton as fallback if no header is provided
          className={i === 3 || i === 6 ? "md:col-span-2" : ""}
        />
      ))}
    </BentoGrid>
  )
}

// Skeleton component for fallback header
const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
)

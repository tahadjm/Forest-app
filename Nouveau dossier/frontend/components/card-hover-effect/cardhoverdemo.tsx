import { HoverEffect } from "./card-hover-effect"

interface Item {
  id: number | string
  name: string
  description: string
  difficulty: string
  image: string
}

interface CardHoverEffectProps {
  items: Item[]
}

export function CardHoverEffectDemo({ items }: CardHoverEffectProps) {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={items} />
    </div>
  )
}

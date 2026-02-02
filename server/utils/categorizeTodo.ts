import { TODO_CATEGORIES } from './todoCategories'

export function categorizeTodo(text: string): string[] {
  const normalized = text.toLowerCase()
  const matchedCategories = new Set<string>()

  for (const [category, keywords] of Object.entries(TODO_CATEGORIES)) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        matchedCategories.add(category)
        break
      }
    }
  }

  return Array.from(matchedCategories)
}

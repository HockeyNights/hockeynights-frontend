/**
 * Цена арены в виде из макета: «8000-15000 RUB/час» → «8 000–15 000 RUB/час».
 */
export function formatArenaPrice(priceRange: string): string {
  return priceRange
    .replace(/\d{4,}/g, (digits) => Number(digits).toLocaleString('ru-RU'))
    .replace(/(\d)\s*-\s*(\d)/g, '$1–$2')
}

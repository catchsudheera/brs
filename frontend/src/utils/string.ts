// Function to capitalize the first letter of each word in a string
export const capitalizeFirstLetter = (string: string): string => {
  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Generic function to group array elements by a key
export function groupBy<T, K extends keyof any>(
  array: T[],
  keyGetter: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (accumulator: Record<K, T[]>, currentItem: T) => {
      const key: K = keyGetter(currentItem);
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(currentItem);
      return accumulator;
    },
    {} as Record<K, T[]>,
  );
}

export function sumBy<T, K extends keyof any>(array: T[], keyGetter: (item: T) => K,): Record<K, Number> {
  return array.reduce(
    (accumulator: Record<K, Number>, currentItem: T) => {
      const key: K = keyGetter(currentItem);
      if (!accumulator[key]) {
        accumulator[key] = 0;
      }
      accumulator[key] = accumulator[key] + currentItem.encounterScore;
      return accumulator;
    },
    {} as Record<K, Number>,
  );
}

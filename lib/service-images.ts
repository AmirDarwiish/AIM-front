import type { Item } from './public-api';

// Real company site photographs cover services whose CMS image is still empty.
// A subsequently uploaded CMS cover always takes precedence.
const serviceCovers: Record<number, string> = {
  29: '/company-work/ap-10.webp',
  44: '/company-work/purity-11.webp',
};

export function serviceImage(item: Pick<Item, 'id' | 'imageUrl'>) {
  return item.imageUrl?.trim() || serviceCovers[item.id];
}

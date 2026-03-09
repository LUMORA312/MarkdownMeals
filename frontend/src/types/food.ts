export type PriceRange = 'Under $10' | 'Under $15' | 'Under $20' | 'Best Value' | 'Family Feast';

export const PRICE_RANGES: PriceRange[] = ['Under $10', 'Under $15', 'Under $20', 'Best Value', 'Family Feast'];

export const PRICE_RANGE_ICONS: Record<PriceRange, string> = {
  'Under $10': '💰',
  'Under $15': '🤑',
  'Under $20': '💎',
  'Best Value': '🏆',
  'Family Feast': '👨‍👩‍👧‍👦',
};

export const PRICE_RANGE_MAX: Record<PriceRange, number | null> = {
  'Under $10': 10,
  'Under $15': 15,
  'Under $20': 20,
  'Best Value': null,
  'Family Feast': null,
};

export type PrimaryTaste = 'Crispy' | 'Cheesy' | 'Spicy' | 'Fresh' | 'Sweet' | 'Saucy';
export type Modifier = 'Vegan' | 'Vegetarian';
export type Category =
  | 'Handheld'
  | 'Bowls & Plates'
  | 'Comfort'
  | 'Fresh & Light'
  | 'Snacky'
  | 'Dessert';

export type Feeds = '3–4' | '5–7' | '8–10' | '10+';
export const FEEDS_OPTIONS: Feeds[] = ['3–4', '5–7', '8–10', '10+'];

export type DealType = 'Lunch Special' | 'Late Night' | 'BOGO' | 'Under $10';

export const DEAL_TYPES: DealType[] = ['Under $10', 'BOGO', 'Late Night', 'Lunch Special'];

export const DEAL_ICONS: Record<DealType, string> = {
  'Lunch Special': '☀️',
  'Late Night': '🌙',
  'BOGO': '🎉',
  'Under $10': '💰',
};

export interface Dish {
  id: string;
  name: string;
  image: string;
  category: Category;
  primaryTaste: PrimaryTaste;
  modifiers: Modifier[];
  price: number;
  feeds: Feeds;
  dealType?: DealType;
  dealExpiresAt: number; // timestamp
  destinationUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  coverImage: string;
  categories: Category[];
  dishes: Dish[];
  redirectUrl: string;
  rating?: number;
  distance: number;
}

export interface RedirectToken {
  id: string;
  restaurantId: string;
  dishIds: string[];
  createdAt: number;
  ratingAvailableAt: number;
}

export type EmojiRating = '😍' | '😋' | '😊' | '😐' | '😕';

export const RATING_TAGS = [
  'Worth the trip',
  'Great value',
  'Perfectly cooked',
  'Fresh ingredients',
  'Beautiful plating',
  'Generous portions',
  'Quick service',
  'Cozy vibes',
  'Would order again',
  'Overrated',
] as const;

export type RatingTag = typeof RATING_TAGS[number];

export const PRIMARY_TASTES: PrimaryTaste[] = ['Crispy', 'Cheesy', 'Spicy', 'Fresh', 'Sweet', 'Saucy'];
export const MODIFIERS: Modifier[] = ['Vegan', 'Vegetarian'];
export const CATEGORIES: Category[] = [
  'Handheld', 'Bowls & Plates', 'Comfort',
  'Fresh & Light', 'Snacky', 'Dessert',
];

export const TASTE_ICONS: Record<PrimaryTaste, string> = {
  'Crispy': '🍟',
  'Cheesy': '🧀',
  'Spicy': '🌶️',
  'Fresh': '🥗',
  'Sweet': '🍰',
  'Saucy': '🍝',
};

export type EatingStyle = Category;
export const EATING_STYLES: EatingStyle[] = ['Handheld', 'Bowls & Plates', 'Comfort', 'Fresh & Light', 'Snacky', 'Dessert'];
export const EATING_STYLE_ICONS: Record<EatingStyle, string> = {
  'Handheld': '🌯',
  'Bowls & Plates': '🍲',
  'Comfort': '🍕',
  'Fresh & Light': '🥗',
  'Snacky': '🍿',
  'Dessert': '🍰',
};

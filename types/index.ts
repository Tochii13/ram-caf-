export type MealPeriod = 'breakfast' | 'lunch' | 'dinner';

export type DietaryTag = 'vegetarian' | 'vegan' | 'glutenFree' | 'highProtein' | 'dairyFree' | 'nutFree' | 'halal';

export type Allergen = 'nuts' | 'dairy' | 'shellfish' | 'gluten' | 'soy' | 'eggs';

export type AvailabilityStatus = 'available' | 'limited' | 'soldOut';

export type AppearanceMode = 'system' | 'light' | 'dark';

export const DIETARY_TAG_LABELS: Record<DietaryTag, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  glutenFree: 'Gluten-Free',
  highProtein: 'High Protein',
  dairyFree: 'Dairy-Free',
  nutFree: 'Nut-Free',
  halal: 'Halal',
};

export const DIETARY_TAG_EMOJIS: Record<DietaryTag, string> = {
  vegetarian: '🥦',
  vegan: '🌱',
  glutenFree: '🌾',
  highProtein: '💪',
  dairyFree: '🥛',
  nutFree: '🥜',
  halal: '☪️',
};

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  nuts: 'Tree Nuts',
  dairy: 'Dairy',
  shellfish: 'Shellfish',
  gluten: 'Gluten',
  soy: 'Soy',
  eggs: 'Eggs',
};

export const MEAL_PERIOD_LABELS: Record<MealPeriod, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export const MEAL_PERIOD_TIMES: Record<MealPeriod, { timeRange: string; startHour: number; endHour: number }> = {
  breakfast: { timeRange: '7:00 AM – 10:00 AM', startHour: 7, endHour: 10 },
  lunch: { timeRange: '11:00 AM – 2:00 PM', startHour: 11, endHour: 14 },
  dinner: { timeRange: '5:00 PM – 8:00 PM', startHour: 17, endHour: 20 },
};

export const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { icon: string; label: string; color: string }> = {
  available: { icon: '🟢', label: 'Available', color: '#6FBF73' },
  limited: { icon: '⚠️', label: 'Limited', color: '#E67E22' },
  soldOut: { icon: '🔴', label: 'Sold Out', color: '#D32F2F' },
};

export interface NutritionFacts {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  calories: number;
  emoji: string;
  dietaryTags: DietaryTag[];
  mealPeriod: MealPeriod;
  allergens: Allergen[];
  ingredients: string;
  nutrition: NutritionFacts;
  availability: AvailabilityStatus;
  lastUpdated: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: Date;
  formattedDate: string;
}

export interface CafeHours {
  mealPeriod: MealPeriod;
  startTime: string;
  endTime: string;
  readonly isOpenNow: boolean;
}

export type UserRole = 'student' | 'admin';

export interface StudentProfile {
  dietaryRestrictions: DietaryTag[];
  hasCompletedOnboarding: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile?: StudentProfile;
}

export interface WeeklyMenuItem {
  id: string;
  name: string;
  description: string;
  calories: number;
  dietaryTags: DietaryTag[];
  mealPeriod: MealPeriod;
  emoji: string;
}

export interface WeeklyDay {
  id: string;
  weekday: string;
  dateLabel: string;
  items: WeeklyMenuItem[];
}

export interface MealRating {
  id: string;
  menuItemID: string;
  menuItemName: string;
  stars: number;
  mealPeriod: MealPeriod;
  date: Date;
}

export type MealServiceStatus = 'completed' | 'serving' | 'preparing';

export interface AdminKpi {
  id: string;
  title: string;
  primaryValue: string;
  secondaryValue?: string;
  tertiaryValue?: string;
}

export interface AdminMealService {
  id: string;
  mealName: string;
  status: MealServiceStatus;
  menuTitle: string;
  timeRange: string;
  servingsPlanned: number;
}

export type PlanStatus = 'ready' | 'inProgress' | 'notStarted';

export interface AdminPlan {
  id: string;
  dateLabel: string;
  dayLabel: string;
  status: PlanStatus;
  title?: string;
}

export interface AdminInventoryAlert {
  id: string;
  itemName: string;
  category: string;
  message: string;
  isNew: boolean;
}

export interface AdminFavorite {
  id: string;
  rank: number;
  name: string;
  category: string;
  count: number;
  deltaPercentage: number;
}

export interface AdminDashboardData {
  kpis: AdminKpi[];
  todayLabel: string;
  todayMeals: AdminMealService[];
  upcomingPlans: AdminPlan[];
  favorites: AdminFavorite[];
}

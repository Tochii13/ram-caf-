import {
  AdminDashboardData,
  AdminInventoryAlert,
  Announcement,
  AvailabilityStatus,
  CafeHours,
  DietaryTag,
  MealPeriod,
  MealRating,
  MenuItem,
  NutritionFacts,
  WeeklyDay,
  WeeklyMenuItem,
} from '@/types';

export const SCHOOL_DOMAIN = 'htu.edu';
export const ADMIN_EMAIL = 'admin@htu.edu';
export const UNIVERSITY_NAME = 'Huston-Tillotson University';

const nowIsOpen = (mealPeriod: MealPeriod, isWeekend: boolean): boolean => {
  const d = new Date();
  const hour = d.getHours() + d.getMinutes() / 60;
  if (isWeekend) {
    if (mealPeriod === 'brunch') return hour >= 11 && hour < 13.5;
    if (mealPeriod === 'dinner') return hour >= 16.5 && hour < 18;
    return false;
  }
  if (mealPeriod === 'breakfast') return hour >= 7 && hour < 9;
  if (mealPeriod === 'lunch') return hour >= 11 && hour < 13.5;
  if (mealPeriod === 'dinner') return hour >= 17 && hour < 19;
  return false;
};

function getIsWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

/** Returns today's cafe hours (weekday vs weekend). */
export function getCafeHoursForToday(): CafeHours[] {
  const isWeekend = getIsWeekend();
  if (isWeekend) {
    return [
      { mealPeriod: 'brunch', startTime: '11:00 AM', endTime: '1:30 PM', get isOpenNow() { return nowIsOpen('brunch', true); } },
      { mealPeriod: 'dinner', startTime: '4:30 PM', endTime: '6:00 PM', get isOpenNow() { return nowIsOpen('dinner', true); } },
    ];
  }
  return [
    { mealPeriod: 'breakfast', startTime: '7:00 AM', endTime: '9:00 AM', get isOpenNow() { return nowIsOpen('breakfast', false); } },
    { mealPeriod: 'lunch', startTime: '11:00 AM', endTime: '1:30 PM', get isOpenNow() { return nowIsOpen('lunch', false); } },
    { mealPeriod: 'dinner', startTime: '5:00 PM', endTime: '7:00 PM', get isOpenNow() { return nowIsOpen('dinner', false); } },
  ];
}

function makeItem(
  id: string,
  name: string,
  description: string,
  calories: number,
  emoji: string,
  dietaryTags: DietaryTag[],
  mealPeriod: MealPeriod,
  allergens: MenuItem['allergens'],
  ingredients: string,
  nutrition: NutritionFacts,
  availability: AvailabilityStatus = 'available',
): MenuItem {
  return {
    id,
    name,
    description,
    calories,
    emoji,
    dietaryTags,
    mealPeriod,
    allergens,
    ingredients,
    nutrition,
    availability,
    lastUpdated: new Date(),
  };
}

export const sampleMenuItems: MenuItem[] = [
  makeItem('1', 'Fluffy Pancakes', 'Light and fluffy pancakes served with maple syrup.', 420, '🍽️',
    ['vegetarian'], 'breakfast', ['gluten', 'dairy', 'eggs'],
    'Enriched flour, eggs, milk, butter, baking powder, sugar, vanilla extract, maple syrup.',
    { protein: 8, carbs: 64, fat: 10, fiber: 2 }),
  makeItem('2', 'Veggie Omelette', 'Three-egg omelette packed with fresh vegetables.', 340, '🍽️',
    ['vegetarian', 'glutenFree'], 'breakfast', ['eggs', 'dairy'],
    'Eggs, bell peppers, onion, mushrooms, spinach, olive oil, salt, pepper.',
    { protein: 22, carbs: 6, fat: 18, fiber: 2 }),
  makeItem('3', 'Overnight Oats', 'Creamy oats topped with fresh berries.', 290, '🍽️',
    ['vegan', 'highProtein'], 'breakfast', ['gluten', 'dairy'],
    'Rolled oats, almond milk, chia seeds, blueberries, strawberries, honey.',
    { protein: 12, carbs: 45, fat: 6, fiber: 6 }),
  makeItem('4', 'Grilled Chicken Salad', 'Fresh greens with grilled chicken breast.', 380, '🍽️',
    ['glutenFree', 'highProtein'], 'lunch', [],
    'Romaine lettuce, grilled chicken breast, cherry tomatoes, cucumber, olive oil, lemon juice.',
    { protein: 38, carbs: 12, fat: 10, fiber: 4 }),
  makeItem('5', 'Black Bean Burger', 'Hearty plant-based burger with all the toppings.', 520, '🍽️',
    ['vegan'], 'lunch', ['gluten', 'soy'],
    'Black beans, brown rice, oats, garlic, cumin, soy sauce, whole wheat bun, lettuce, tomato.',
    { protein: 18, carbs: 58, fat: 14, fiber: 10 }),
  makeItem('6', 'Mediterranean Bowl', 'Quinoa, hummus, and roasted vegetables.', 450, '🍽️',
    ['vegetarian', 'glutenFree'], 'lunch', [],
    'Quinoa, hummus, roasted zucchini, cherry tomatoes, cucumber, kalamata olives, feta, olive oil.',
    { protein: 14, carbs: 52, fat: 16, fiber: 8 }),
  makeItem('7', 'Herb Roasted Chicken', 'Tender chicken with herb seasoning.', 520, '🍽️',
    ['glutenFree', 'highProtein'], 'dinner', [],
    'Chicken breast, olive oil, rosemary, thyme, garlic, lemon zest, salt, pepper.',
    { protein: 48, carbs: 4, fat: 18, fiber: 0 }),
  makeItem('8', 'Pasta Primavera', 'Al dente pasta with seasonal vegetables.', 480, '🍽️',
    ['vegetarian'], 'dinner', ['gluten', 'dairy'],
    'Penne pasta, zucchini, cherry tomatoes, broccoli, parmesan, olive oil, garlic, basil.',
    { protein: 16, carbs: 62, fat: 14, fiber: 6 }),
  makeItem('9', 'Grilled Salmon', 'Atlantic salmon with lemon butter sauce.', 480, '🍽️',
    ['glutenFree', 'highProtein'], 'dinner', [],
    'Atlantic salmon fillet, butter, lemon, dill, garlic, salt, pepper.',
    { protein: 42, carbs: 0, fat: 22, fiber: 0 }),
  makeItem('10', 'Vegetable Stir Fry', 'Fresh vegetables in a savory ginger sauce.', 380, '🍽️',
    ['vegan', 'glutenFree'], 'dinner', ['soy'],
    'Broccoli, snap peas, carrots, bell peppers, soy sauce, ginger, garlic, sesame oil, rice.',
    { protein: 8, carbs: 48, fat: 10, fiber: 6 }),
  // Non-halal examples for presentation (contain pork)
  makeItem('11', 'Crispy Bacon & Eggs', 'Smoky bacon strips served with scrambled eggs and toast.', 520, '🍽️',
    ['highProtein'], 'breakfast', ['pork', 'eggs', 'dairy', 'gluten'],
    'Pork bacon, eggs, butter, milk, toast, salt, pepper.',
    { protein: 26, carbs: 24, fat: 34, fiber: 2 }),
  makeItem('12', 'BBQ Pulled Pork Sandwich', 'Slow-cooked pulled pork on a toasted bun with slaw.', 640, '🍽️',
    [], 'lunch', ['pork', 'gluten'],
    'Pulled pork, barbecue sauce, brioche bun, cabbage slaw, pickles.',
    { protein: 32, carbs: 58, fat: 26, fiber: 3 }),
];

export const sampleAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Extended Hours This Week',
    content: 'The Main Cafeteria will have extended dinner hours until 9 PM during finals week.',
    date: new Date('2026-01-25T12:00:00'),
    formattedDate: 'Jan 25',
  },
  {
    id: 'a2',
    title: 'New Menu Items',
    content: 'Try our new plant-based options available starting Monday!',
    date: new Date('2026-01-24T12:00:00'),
    formattedDate: 'Jan 24',
  },
];

export const sampleCafeHours: CafeHours[] = getCafeHoursForToday();

function createWeeklyItem(id: string, name: string, description: string, calories: number, dietaryTags: DietaryTag[], mealPeriod: MealPeriod): WeeklyMenuItem {
  return { id, name, description, calories, dietaryTags, mealPeriod, emoji: '🍽️' };
}

export const initialWeeklyMenu: WeeklyDay[] = [
  {
    id: 'wd-1',
    weekday: 'Monday',
    dateLabel: 'Feb 23',
    items: [
      createWeeklyItem('wd-1-b1', 'Scrambled Eggs', 'Fluffy scrambled eggs with chives.', 310, ['glutenFree', 'highProtein'], 'breakfast'),
      createWeeklyItem('wd-1-b2', 'Fluffy Pancakes', 'Light and fluffy pancakes served with maple syrup.', 420, ['vegetarian'], 'breakfast'),
      createWeeklyItem('wd-1-l1', 'Grilled Chicken Salad', 'Fresh greens with grilled chicken breast.', 380, ['glutenFree', 'highProtein'], 'lunch'),
      createWeeklyItem('wd-1-l2', 'Mediterranean Bowl', 'Quinoa, hummus, and roasted vegetables.', 450, ['vegetarian', 'glutenFree'], 'lunch'),
      createWeeklyItem('wd-1-d1', 'Herb Roasted Chicken', 'Tender chicken with herb seasoning.', 520, ['glutenFree', 'highProtein'], 'dinner'),
      createWeeklyItem('wd-1-d2', 'Vegetable Stir Fry', 'Fresh vegetables in a savory ginger sauce.', 380, ['vegan', 'glutenFree'], 'dinner'),
    ],
  },
  {
    id: 'wd-2',
    weekday: 'Tuesday',
    dateLabel: 'Feb 24',
    items: [
      createWeeklyItem('wd-2-b1', 'Overnight Oats', 'Creamy oats topped with fresh berries.', 290, ['vegan', 'highProtein'], 'breakfast'),
      createWeeklyItem('wd-2-b2', 'Veggie Omelette', 'Three-egg omelette packed with fresh vegetables.', 340, ['vegetarian', 'glutenFree'], 'breakfast'),
      createWeeklyItem('wd-2-l1', 'Black Bean Burger', 'Hearty plant-based burger with all the toppings.', 520, ['vegan'], 'lunch'),
      createWeeklyItem('wd-2-l2', 'Grilled Chicken Salad', 'Fresh greens with grilled chicken breast.', 380, ['glutenFree', 'highProtein'], 'lunch'),
      createWeeklyItem('wd-2-d1', 'Grilled Salmon', 'Atlantic salmon with lemon butter sauce.', 480, ['glutenFree', 'highProtein'], 'dinner'),
      createWeeklyItem('wd-2-d2', 'Pasta Primavera', 'Al dente pasta with seasonal vegetables.', 480, ['vegetarian'], 'dinner'),
    ],
  },
  {
    id: 'wd-3',
    weekday: 'Wednesday',
    dateLabel: 'Feb 25',
    items: [
      createWeeklyItem('wd-3-b1', 'Fluffy Pancakes', 'Light and fluffy pancakes served with maple syrup.', 420, ['vegetarian'], 'breakfast'),
      createWeeklyItem('wd-3-b2', 'Overnight Oats', 'Creamy oats topped with fresh berries.', 290, ['vegan', 'highProtein'], 'breakfast'),
      createWeeklyItem('wd-3-l1', 'Mediterranean Bowl', 'Quinoa, hummus, and roasted vegetables.', 450, ['vegetarian', 'glutenFree'], 'lunch'),
      createWeeklyItem('wd-3-l2', 'Black Bean Burger', 'Hearty plant-based burger with all the toppings.', 520, ['vegan'], 'lunch'),
      createWeeklyItem('wd-3-d1', 'Pasta Primavera', 'Al dente pasta with seasonal vegetables.', 480, ['vegetarian'], 'dinner'),
      createWeeklyItem('wd-3-d2', 'Herb Roasted Chicken', 'Tender chicken with herb seasoning.', 520, ['glutenFree', 'highProtein'], 'dinner'),
    ],
  },
  {
    id: 'wd-4',
    weekday: 'Thursday',
    dateLabel: 'Feb 26',
    items: [
      createWeeklyItem('wd-4-b1', 'Veggie Omelette', 'Three-egg omelette packed with fresh vegetables.', 340, ['vegetarian', 'glutenFree'], 'breakfast'),
      createWeeklyItem('wd-4-b2', 'Scrambled Eggs', 'Fluffy scrambled eggs with chives.', 310, ['glutenFree', 'highProtein'], 'breakfast'),
      createWeeklyItem('wd-4-l1', 'Grilled Chicken Salad', 'Fresh greens with grilled chicken breast.', 380, ['glutenFree', 'highProtein'], 'lunch'),
      createWeeklyItem('wd-4-l2', 'Mediterranean Bowl', 'Quinoa, hummus, and roasted vegetables.', 450, ['vegetarian', 'glutenFree'], 'lunch'),
      createWeeklyItem('wd-4-d1', 'Vegetable Stir Fry', 'Fresh vegetables in a savory ginger sauce.', 380, ['vegan', 'glutenFree'], 'dinner'),
      createWeeklyItem('wd-4-d2', 'Grilled Salmon', 'Atlantic salmon with lemon butter sauce.', 480, ['glutenFree', 'highProtein'], 'dinner'),
    ],
  },
  {
    id: 'wd-5',
    weekday: 'Friday',
    dateLabel: 'Feb 27',
    items: [
      createWeeklyItem('wd-5-b1', 'Overnight Oats', 'Creamy oats topped with fresh berries.', 290, ['vegan', 'highProtein'], 'breakfast'),
      createWeeklyItem('wd-5-b2', 'Fluffy Pancakes', 'Light and fluffy pancakes served with maple syrup.', 420, ['vegetarian'], 'breakfast'),
      createWeeklyItem('wd-5-l1', 'Black Bean Burger', 'Hearty plant-based burger with all the toppings.', 520, ['vegan'], 'lunch'),
      createWeeklyItem('wd-5-l2', 'Grilled Chicken Salad', 'Fresh greens with grilled chicken breast.', 380, ['glutenFree', 'highProtein'], 'lunch'),
      createWeeklyItem('wd-5-d1', 'Herb Roasted Chicken', 'Tender chicken with herb seasoning.', 520, ['glutenFree', 'highProtein'], 'dinner'),
      createWeeklyItem('wd-5-d2', 'Pasta Primavera', 'Al dente pasta with seasonal vegetables.', 480, ['vegetarian'], 'dinner'),
    ],
  },
  {
    id: 'wd-6',
    weekday: 'Saturday',
    dateLabel: 'Feb 28',
    items: [
      createWeeklyItem('wd-6-b1', 'Fluffy Pancakes', 'Light and fluffy pancakes served with maple syrup.', 420, ['vegetarian'], 'breakfast'),
      createWeeklyItem('wd-6-b2', 'Veggie Omelette', 'Three-egg omelette packed with fresh vegetables.', 340, ['vegetarian', 'glutenFree'], 'breakfast'),
      createWeeklyItem('wd-6-l1', 'Mediterranean Bowl', 'Quinoa, hummus, and roasted vegetables.', 450, ['vegetarian', 'glutenFree'], 'lunch'),
      createWeeklyItem('wd-6-l2', 'Black Bean Burger', 'Hearty plant-based burger with all the toppings.', 520, ['vegan'], 'lunch'),
      createWeeklyItem('wd-6-d1', 'Grilled Salmon', 'Atlantic salmon with lemon butter sauce.', 480, ['glutenFree', 'highProtein'], 'dinner'),
      createWeeklyItem('wd-6-d2', 'Vegetable Stir Fry', 'Fresh vegetables in a savory ginger sauce.', 380, ['vegan', 'glutenFree'], 'dinner'),
    ],
  },
  {
    id: 'wd-7',
    weekday: 'Sunday',
    dateLabel: 'Mar 1',
    items: [
      createWeeklyItem('wd-7-b1', 'Veggie Omelette', 'Three-egg omelette packed with fresh vegetables.', 340, ['vegetarian', 'glutenFree'], 'breakfast'),
      createWeeklyItem('wd-7-b2', 'Overnight Oats', 'Creamy oats topped with fresh berries.', 290, ['vegan', 'highProtein'], 'breakfast'),
      createWeeklyItem('wd-7-l1', 'Grilled Chicken Salad', 'Fresh greens with grilled chicken breast.', 380, ['glutenFree', 'highProtein'], 'lunch'),
      createWeeklyItem('wd-7-l2', 'Mediterranean Bowl', 'Quinoa, hummus, and roasted vegetables.', 450, ['vegetarian', 'glutenFree'], 'lunch'),
      createWeeklyItem('wd-7-d1', 'Pasta Primavera', 'Al dente pasta with seasonal vegetables.', 480, ['vegetarian'], 'dinner'),
      createWeeklyItem('wd-7-d2', 'Herb Roasted Chicken', 'Tender chicken with herb seasoning.', 520, ['glutenFree', 'highProtein'], 'dinner'),
    ],
  },
];

export const adminDashboardData: AdminDashboardData = {
  kpis: [
    { id: 'k1', title: 'Meals Served Today', primaryValue: '347', secondaryValue: 'of 525 expected', tertiaryValue: '+8% vs yesterday' },
    { id: 'k2', title: 'Active Students', primaryValue: '892' },
    { id: 'k3', title: 'Inventory', primaryValue: '312 items', secondaryValue: '4 low stock' },
    { id: 'k4', title: 'Weekly Spend', primaryValue: '$12,450', secondaryValue: '$1,850 under budget', tertiaryValue: '+12% savings' },
  ],
  todayLabel: 'Tuesday, Feb 24',
  todayMeals: [
    { id: 'm1', mealName: 'Breakfast', status: 'completed', menuTitle: 'Southern Breakfast Platter', timeRange: '7:00–9:30 AM', servingsPlanned: 150 },
    { id: 'm2', mealName: 'Lunch', status: 'serving', menuTitle: 'Grilled Chicken Caesar', timeRange: '11:30 AM–2:00 PM', servingsPlanned: 200 },
    { id: 'm3', mealName: 'Dinner', status: 'preparing', menuTitle: 'BBQ Brisket', timeRange: '5:00–7:30 PM', servingsPlanned: 175 },
  ],
  upcomingPlans: [
    { id: 'p1', dateLabel: 'Jan 31', dayLabel: 'Tomorrow', status: 'ready', title: 'Taco Bar & Nachos' },
    { id: 'p2', dateLabel: 'Feb 1', dayLabel: 'Saturday', status: 'ready', title: 'Weekend Brunch' },
    { id: 'p3', dateLabel: 'Feb 2', dayLabel: 'Sunday', status: 'inProgress', title: 'Soul Food Sunday' },
    { id: 'p4', dateLabel: 'Feb 3', dayLabel: 'Monday', status: 'notStarted' },
  ],
  favorites: [
    { id: 'f1', rank: 1, name: 'Crispy Fried Chicken', category: 'Protein', count: 234, deltaPercentage: 12 },
    { id: 'f2', rank: 2, name: 'Mac & Cheese', category: 'Sides', count: 198, deltaPercentage: 8 },
    { id: 'f3', rank: 3, name: 'Fresh Fruit Bowl', category: 'Healthy', count: 156, deltaPercentage: 24 },
    { id: 'f4', rank: 4, name: 'Texas Toast', category: 'Bread', count: 142, deltaPercentage: -3 },
  ],
};

export const initialInventoryAlerts: AdminInventoryAlert[] = [
  { id: 'i1', itemName: 'Fresh Chicken Breast', category: 'Meat', message: 'Only 15 lbs remaining', isNew: false },
  { id: 'i2', itemName: 'Romaine Lettuce', category: 'Produce', message: 'Expires in 2 days', isNew: false },
  { id: 'i3', itemName: 'Milk Gallon', category: 'Dairy', message: 'Only 8 units remaining', isNew: false },
  { id: 'i4', itemName: 'White Rice', category: 'Dry Goods', message: '30% waste rate this week', isNew: false },
];

export const sampleSeedRatings: MealRating[] = [
  { id: 'r1', menuItemID: '1', menuItemName: 'Fluffy Pancakes', stars: 5, mealPeriod: 'breakfast', date: new Date() },
  { id: 'r2', menuItemID: '2', menuItemName: 'Veggie Omelette', stars: 4, mealPeriod: 'breakfast', date: new Date() },
  { id: 'r3', menuItemID: '4', menuItemName: 'Grilled Chicken Salad', stars: 4, mealPeriod: 'lunch', date: new Date() },
  { id: 'r4', menuItemID: '5', menuItemName: 'Black Bean Burger', stars: 3, mealPeriod: 'lunch', date: new Date() },
  { id: 'r5', menuItemID: '9', menuItemName: 'Grilled Salmon', stars: 5, mealPeriod: 'dinner', date: new Date() },
  { id: 'r6', menuItemID: '8', menuItemName: 'Pasta Primavera', stars: 4, mealPeriod: 'dinner', date: new Date() },
];

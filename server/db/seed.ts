import { db } from '../index.ts';
import { categories, products } from './schema.ts';

const dummyCategories = [
  {
    id: 1,
    name: 'Pizza',
    description: 'Delicious pizzas with fresh ingredients.',
    displayOrder: 1,
  },
  {
    id: 2,
    name: 'Burgers',
    description: 'Juicy burgers with various toppings.',
    displayOrder: 2,
  },
  {
    id: 3,
    name: 'Salads',
    description: 'Fresh and healthy salads.',
    displayOrder: 3,
  },
  {
    id: 4,
    name: 'Drinks',
    description: 'Cold and hot beverages.',
    displayOrder: 4,
  },
  {
    id: 5,
    name: 'Desserts',
    description: 'Sweet treats to finish your meal.',
    displayOrder: 5,
  },
];

const dummyProducts: {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  options: {
    name: string;
    type: 'single' | 'multiple';
    required: boolean;
    choices: { label: string; price: number }[];
  }[];
  imageUrl: string;
}[] = [
  {
    categoryId: 3,
    name: 'Caesar Salad',
    description:
      'Crisp romaine lettuce, parmesan, croutons, and Caesar dressing.',
    price: 5.99,
    options: [
      {
        name: 'Add Chicken',
        type: 'single',
        required: false,
        choices: [
          { label: 'Yes', price: 2 },
          { label: 'No', price: 0 },
        ],
      },
      {
        name: 'Dressing',
        type: 'single',
        required: true,
        choices: [
          { label: 'Caesar', price: 0 },
          { label: 'Ranch', price: 0 },
          { label: 'Italian', price: 0 },
        ],
      },
    ],
    imageUrl: 'https://example.com/images/caesar-salad.jpg',
  },
];

async function seed() {
  try {
    console.log('🌱 Seeding categories...');
    await db.insert(categories).values(dummyCategories);
    console.log('✅ Categories seeded successfully!');

    console.log('🌱 Seeding products...');
    await db
      .insert(products)
      .values(dummyProducts.map((p) => ({ ...p, price: p.price.toString() })));
    console.log('✅ Products seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seed();

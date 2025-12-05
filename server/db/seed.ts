import { db } from '../index.ts';
import { categories, products } from './schema.ts';
import { user, account } from '../auth-schema.ts';
import crypto from 'crypto';
import { hashPassword } from 'better-auth/crypto';

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
    // Pizzas
    {
      categoryId: 1,
      name: 'Margherita Pizza',
      description:
        'Classic pizza with tomato sauce, mozzarella, and fresh basil.',
      price: 12.99,
      options: [
        {
          name: 'Size',
          type: 'single',
          required: true,
          choices: [
            { label: 'Small', price: 0 },
            { label: 'Medium', price: 3 },
            { label: 'Large', price: 6 },
          ],
        },
        {
          name: 'Extra Toppings',
          type: 'multiple',
          required: false,
          choices: [
            { label: 'Extra Cheese', price: 2 },
            { label: 'Mushrooms', price: 1.5 },
            { label: 'Olives', price: 1.5 },
          ],
        },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    },
    {
      categoryId: 1,
      name: 'Pepperoni Pizza',
      description: 'Loaded with pepperoni and mozzarella cheese.',
      price: 14.99,
      options: [
        {
          name: 'Size',
          type: 'single',
          required: true,
          choices: [
            { label: 'Small', price: 0 },
            { label: 'Medium', price: 3 },
            { label: 'Large', price: 6 },
          ],
        },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    },
    // Burgers
    {
      categoryId: 2,
      name: 'Classic Cheeseburger',
      description: 'Beef patty with cheese, lettuce, tomato, and special sauce.',
      price: 9.99,
      options: [
        {
          name: 'Cooking Level',
          type: 'single',
          required: true,
          choices: [
            { label: 'Medium Rare', price: 0 },
            { label: 'Medium', price: 0 },
            { label: 'Well Done', price: 0 },
          ],
        },
        {
          name: 'Add-ons',
          type: 'multiple',
          required: false,
          choices: [
            { label: 'Bacon', price: 2 },
            { label: 'Avocado', price: 1.5 },
            { label: 'Extra Patty', price: 3 },
          ],
        },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    },
    {
      categoryId: 2,
      name: 'Chicken Burger',
      description: 'Grilled chicken breast with lettuce and mayo.',
      price: 8.99,
      options: [
        {
          name: 'Spice Level',
          type: 'single',
          required: true,
          choices: [
            { label: 'Mild', price: 0 },
            { label: 'Spicy', price: 0 },
            { label: 'Extra Spicy', price: 0.5 },
          ],
        },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400',
    },
    // Salads
    {
      categoryId: 3,
      name: 'Caesar Salad',
      description:
        'Crisp romaine lettuce, parmesan, croutons, and Caesar dressing.',
      price: 7.99,
      options: [
        {
          name: 'Add Protein',
          type: 'single',
          required: false,
          choices: [
            { label: 'Grilled Chicken', price: 3 },
            { label: 'Grilled Shrimp', price: 4 },
            { label: 'No Protein', price: 0 },
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
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    },
    {
      categoryId: 3,
      name: 'Greek Salad',
      description: 'Fresh vegetables with feta cheese and olives.',
      price: 8.49,
      options: [],
      imageUrl:
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    },
    // Drinks
    {
      categoryId: 4,
      name: 'Fresh Lemonade',
      description: 'Freshly squeezed lemonade.',
      price: 3.99,
      options: [
        {
          name: 'Size',
          type: 'single',
          required: true,
          choices: [
            { label: 'Regular', price: 0 },
            { label: 'Large', price: 1 },
          ],
        },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400',
    },
    {
      categoryId: 4,
      name: 'Iced Coffee',
      description: 'Cold brew coffee over ice.',
      price: 4.49,
      options: [
        {
          name: 'Milk',
          type: 'single',
          required: false,
          choices: [
            { label: 'Regular Milk', price: 0 },
            { label: 'Oat Milk', price: 0.5 },
            { label: 'Almond Milk', price: 0.5 },
          ],
        },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
    },
    // Desserts
    {
      categoryId: 5,
      name: 'Chocolate Brownie',
      description: 'Rich chocolate brownie with vanilla ice cream.',
      price: 5.99,
      options: [
        {
          name: 'Add Ice Cream',
          type: 'single',
          required: false,
          choices: [
            { label: 'Yes', price: 1.5 },
            { label: 'No', price: 0 },
          ],
        },
      ],
      imageUrl:
        'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    },
    {
      categoryId: 5,
      name: 'Cheesecake',
      description: 'Creamy New York style cheesecake.',
      price: 6.49,
      options: [],
      imageUrl:
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
    },
  ];

async function seed() {
  try {
    console.log('🌱 Seeding users...');

    // Create users with different roles
    const usersData = [
      {
        id: crypto.randomUUID(),
        name: 'Regular User',
        email: 'user@hotdrop.com',
        emailVerified: true,
        role: 'user',
        password: 'password123',
      },
      {
        id: crypto.randomUUID(),
        name: 'Admin User',
        email: 'admin@hotdrop.com',
        emailVerified: true,
        role: 'admin',
        password: 'password123',
      },
      {
        id: crypto.randomUUID(),
        name: 'Delivery Driver',
        email: 'delivery@hotdrop.com',
        emailVerified: true,
        role: 'delivery',
        password: 'password123',
      },
    ];

    // Insert users
    for (const userData of usersData) {
      const { password, ...userWithoutPassword } = userData;

      // Hash the password
      const hashedPassword = await hashPassword(password);

      // Insert user
      await db.insert(user).values(userWithoutPassword);

      // Insert account with hashed password
      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: crypto.randomUUID(),
        providerId: 'credential',
        userId: userData.id,
        password: hashedPassword,
      });

      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('✅ Users seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   User:     user@hotdrop.com / password123');
    console.log('   Admin:    admin@hotdrop.com / password123');
    console.log('   Delivery: delivery@hotdrop.com / password123\n');

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

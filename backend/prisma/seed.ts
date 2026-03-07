import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hours = (h: number) => new Date(Date.now() + h * 60 * 60 * 1000);

async function main() {
  // Clear existing data (order matters for referential integrity)
  await prisma.ratingTag.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.tokenDish.deleteMany();
  await prisma.redirectToken.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.dishModifier.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.restaurantCategory.deleteMany();
  await prisma.restaurant.deleteMany();

  // Restaurant 1: The Flame & Grill
  const r1 = await prisma.restaurant.create({
    data: {
      name: 'The Flame & Grill',
      coverImage: '/images/burger.jpg',
      redirectUrl: 'https://example.com/flame-grill',
      categories: {
        create: [
          { name: 'Burgers & Sandwiches' },
          { name: 'Steak & Grill' },
        ],
      },
      dishes: {
        create: [
          { name: 'Classic Smash Burger', image: '/images/burger.jpg', category: 'Burgers & Sandwiches', primaryTaste: 'Savory', price: 7.99, originalPrice: 12.99, dealType: 'Under $10', dealExpiresAt: hours(6), modifiers: { create: [] } },
          { name: 'Ribeye Steak', image: '/images/steak.jpg', category: 'Steak & Grill', primaryTaste: 'Savory', price: 18.99, originalPrice: 28.99, dealType: 'BOGO', dealExpiresAt: hours(3), modifiers: { create: [] } },
          { name: 'Loaded Mac & Cheese', image: '/images/mac-cheese.jpg', category: 'Comfort Classics', primaryTaste: 'Cheesy', price: 6.99, dealType: 'Under $10', dealExpiresAt: hours(8), modifiers: { create: [] } },
          { name: 'Fish Tacos', image: '/images/tacos.jpg', category: 'Mexican & Latin', primaryTaste: 'Crispy', price: 9.49, originalPrice: 13.99, dealType: 'Lunch Special', dealExpiresAt: hours(4), modifiers: { create: [{ name: 'Spicy' }] } },
          { name: 'Chocolate Lava Cake', image: '/images/chocolate-cake.jpg', category: 'Desserts & Sweets', primaryTaste: 'Sweet', price: 5.99, dealType: 'BOGO', dealExpiresAt: hours(5), modifiers: { create: [] } },
          { name: 'Grilled Salmon', image: '/images/salmon.jpg', category: 'Seafood', primaryTaste: 'Fresh', price: 14.99, originalPrice: 22.00, dealType: 'BOGO', dealExpiresAt: hours(2), modifiers: { create: [] } },
          { name: 'Pad Thai', image: '/images/pad-thai.jpg', category: 'Asian', primaryTaste: 'Savory', price: 8.99, dealType: 'Under $10', dealExpiresAt: hours(10), modifiers: { create: [{ name: 'Spicy' }] } },
          { name: 'Margherita Pizza', image: '/images/pizza.jpg', category: 'Pizza & Italian', primaryTaste: 'Cheesy', price: 9.99, originalPrice: 14.99, dealType: 'Late Night', dealExpiresAt: hours(12), modifiers: { create: [{ name: 'Vegetarian' }] } },
          { name: 'Poke Bowl', image: '/images/poke-bowl.jpg', category: 'Salads & Bowls', primaryTaste: 'Fresh', price: 8.49, dealType: 'Lunch Special', dealExpiresAt: hours(5), modifiers: { create: [] } },
        ],
      },
    },
  });

  // Restaurant 2: Sakura Kitchen
  const r2 = await prisma.restaurant.create({
    data: {
      name: 'Sakura Kitchen',
      coverImage: '/images/pad-thai.jpg',
      redirectUrl: 'https://example.com/sakura',
      categories: {
        create: [
          { name: 'Asian' },
          { name: 'Salads & Bowls' },
        ],
      },
      dishes: {
        create: [
          { name: 'Spicy Pad Thai', image: '/images/pad-thai.jpg', category: 'Asian', primaryTaste: 'Savory', price: 7.99, dealType: 'Under $10', dealExpiresAt: hours(7), modifiers: { create: [{ name: 'Spicy' }] } },
          { name: 'Salmon Poke Bowl', image: '/images/poke-bowl.jpg', category: 'Salads & Bowls', primaryTaste: 'Fresh', price: 9.99, originalPrice: 15.99, dealType: 'BOGO', dealExpiresAt: hours(4), modifiers: { create: [] } },
          { name: 'Grilled Teriyaki Salmon', image: '/images/salmon.jpg', category: 'Seafood', primaryTaste: 'Savory', price: 13.99, originalPrice: 19.99, dealType: 'BOGO', dealExpiresAt: hours(3), modifiers: { create: [] } },
          { name: 'Mochi Ice Cream', image: '/images/chocolate-cake.jpg', category: 'Desserts & Sweets', primaryTaste: 'Sweet', price: 4.99, dealType: 'Under $10', dealExpiresAt: hours(9), modifiers: { create: [] } },
          { name: 'Veggie Tempura', image: '/images/tacos.jpg', category: 'Asian', primaryTaste: 'Crispy', price: 6.49, dealType: 'Lunch Special', dealExpiresAt: hours(5), modifiers: { create: [{ name: 'Vegetarian' }] } },
          { name: 'Truffle Mac Bowl', image: '/images/mac-cheese.jpg', category: 'Comfort Classics', primaryTaste: 'Comfort', price: 8.99, originalPrice: 13.99, dealType: 'Late Night', dealExpiresAt: hours(14), modifiers: { create: [] } },
          { name: 'Wagyu Burger', image: '/images/burger.jpg', category: 'Burgers & Sandwiches', primaryTaste: 'Savory', price: 11.99, originalPrice: 18.99, dealType: 'BOGO', dealExpiresAt: hours(2), modifiers: { create: [] } },
          { name: 'Neapolitan Pizza', image: '/images/pizza.jpg', category: 'Pizza & Italian', primaryTaste: 'Cheesy', price: 8.99, dealType: 'Under $10', dealExpiresAt: hours(6), modifiers: { create: [] } },
          { name: 'Herb-Crusted Steak', image: '/images/steak.jpg', category: 'Steak & Grill', primaryTaste: 'Savory', price: 16.99, originalPrice: 26.99, dealType: 'Late Night', dealExpiresAt: hours(11), modifiers: { create: [] } },
        ],
      },
    },
  });

  // Restaurant 3: Dolce Vita
  const r3 = await prisma.restaurant.create({
    data: {
      name: 'Dolce Vita',
      coverImage: '/images/pizza.jpg',
      redirectUrl: 'https://example.com/dolce-vita',
      categories: {
        create: [
          { name: 'Pizza & Italian' },
          { name: 'Desserts & Sweets' },
        ],
      },
      dishes: {
        create: [
          { name: 'Wood-Fired Margherita', image: '/images/pizza.jpg', category: 'Pizza & Italian', primaryTaste: 'Cheesy', price: 8.99, originalPrice: 14.99, dealType: 'BOGO', dealExpiresAt: hours(6), modifiers: { create: [{ name: 'Vegetarian' }] } },
          { name: 'Tiramisu', image: '/images/chocolate-cake.jpg', category: 'Desserts & Sweets', primaryTaste: 'Sweet', price: 5.49, dealType: 'Under $10', dealExpiresAt: hours(8), modifiers: { create: [] } },
          { name: 'Seafood Linguine', image: '/images/salmon.jpg', category: 'Seafood', primaryTaste: 'Fresh', price: 12.99, originalPrice: 19.99, dealType: 'BOGO', dealExpiresAt: hours(3), modifiers: { create: [] } },
          { name: 'Burrata Salad', image: '/images/poke-bowl.jpg', category: 'Salads & Bowls', primaryTaste: 'Fresh', price: 7.99, dealType: 'Lunch Special', dealExpiresAt: hours(5), modifiers: { create: [{ name: 'Vegetarian' }] } },
          { name: 'Truffle Fries', image: '/images/mac-cheese.jpg', category: 'Comfort Classics', primaryTaste: 'Crispy', price: 5.99, dealType: 'Under $10', dealExpiresAt: hours(10), modifiers: { create: [] } },
          { name: 'Italian Burger', image: '/images/burger.jpg', category: 'Burgers & Sandwiches', primaryTaste: 'Savory', price: 9.99, originalPrice: 14.99, dealType: 'Late Night', dealExpiresAt: hours(13), modifiers: { create: [] } },
          { name: 'Spicy Arrabbiata', image: '/images/pad-thai.jpg', category: 'Pizza & Italian', primaryTaste: 'Savory', price: 7.49, dealType: 'Under $10', dealExpiresAt: hours(7), modifiers: { create: [{ name: 'Spicy' }, { name: 'Vegan' }] } },
          { name: 'Grilled Branzino', image: '/images/steak.jpg', category: 'Seafood', primaryTaste: 'Fresh', price: 15.99, originalPrice: 24.99, dealType: 'BOGO', dealExpiresAt: hours(2), modifiers: { create: [] } },
          { name: 'Street Tacos', image: '/images/tacos.jpg', category: 'Mexican & Latin', primaryTaste: 'Savory', price: 6.99, dealType: 'BOGO', dealExpiresAt: hours(4), modifiers: { create: [{ name: 'Spicy' }] } },
        ],
      },
    },
  });

  console.log('Seeded:', { r1: r1.id, r2: r2.id, r3: r3.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

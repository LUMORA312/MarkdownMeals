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
      redirectUrl: 'https://google.com',
      distance: 1.2,
      categories: {
        create: [
          { name: 'Handheld' },
          { name: 'Comfort' },
        ],
      },
      dishes: {
        create: [
          { name: 'Classic Smash Burger', image: '/images/burger.jpg', category: 'Handheld', primaryTaste: 'Cheesy', price: 7.99, feeds: '3–4', dealType: 'Under $10', dealExpiresAt: hours(6), destinationUrl: 'https://www.doordash.com', modifiers: { create: [] } },
          { name: 'Ribeye Steak', image: '/images/steak.jpg', category: 'Bowls & Plates', primaryTaste: 'Crispy', price: 18.99, feeds: '3–4', dealType: 'BOGO', dealExpiresAt: hours(3), destinationUrl: 'https://www.ubereats.com', modifiers: { create: [] } },
          { name: 'Loaded Mac & Cheese', image: '/images/mac-cheese.jpg', category: 'Comfort', primaryTaste: 'Cheesy', price: 6.99, feeds: '5–7', dealType: 'Under $10', dealExpiresAt: hours(8), modifiers: { create: [] } },
          { name: 'Fish Tacos', image: '/images/tacos.jpg', category: 'Handheld', primaryTaste: 'Crispy', price: 9.49, feeds: '3–4', dealType: 'Lunch Special', dealExpiresAt: hours(4), modifiers: { create: [] } },
          { name: 'Chocolate Lava Cake', image: '/images/chocolate-cake.jpg', category: 'Dessert', primaryTaste: 'Sweet', price: 5.99, feeds: '3–4', dealType: 'BOGO', dealExpiresAt: hours(5), modifiers: { create: [] } },
          { name: 'Grilled Salmon', image: '/images/salmon.jpg', category: 'Bowls & Plates', primaryTaste: 'Fresh', price: 14.99, feeds: '5–7', dealType: 'BOGO', dealExpiresAt: hours(2), destinationUrl: 'https://www.grubhub.com', modifiers: { create: [] } },
          { name: 'Pad Thai', image: '/images/pad-thai.jpg', category: 'Bowls & Plates', primaryTaste: 'Spicy', price: 8.99, feeds: '8–10', dealType: 'Under $10', dealExpiresAt: hours(10), modifiers: { create: [] } },
          { name: 'Margherita Pizza', image: '/images/pizza.jpg', category: 'Handheld', primaryTaste: 'Cheesy', price: 9.99, feeds: '10+', dealType: 'Late Night', dealExpiresAt: hours(12), modifiers: { create: [{ name: 'Vegetarian' }] } },
          { name: 'Poke Bowl', image: '/images/poke-bowl.jpg', category: 'Fresh & Light', primaryTaste: 'Fresh', price: 8.49, feeds: '3–4', dealType: 'Lunch Special', dealExpiresAt: hours(5), modifiers: { create: [] } },
        ],
      },
    },
  });

  // Restaurant 2: Sakura Kitchen
  const r2 = await prisma.restaurant.create({
    data: {
      name: 'Sakura Kitchen',
      coverImage: '/images/pad-thai.jpg',
      redirectUrl: 'https://google.com',
      distance: 2.5,
      categories: {
        create: [
          { name: 'Bowls & Plates' },
          { name: 'Fresh & Light' },
        ],
      },
      dishes: {
        create: [
          { name: 'Spicy Pad Thai', image: '/images/pad-thai.jpg', category: 'Bowls & Plates', primaryTaste: 'Spicy', price: 7.99, feeds: '3–4', dealType: 'Under $10', dealExpiresAt: hours(7), destinationUrl: 'https://www.doordash.com', modifiers: { create: [] } },
          { name: 'Salmon Poke Bowl', image: '/images/poke-bowl.jpg', category: 'Fresh & Light', primaryTaste: 'Fresh', price: 9.99, feeds: '3–4', dealType: 'BOGO', dealExpiresAt: hours(4), modifiers: { create: [] } },
          { name: 'Grilled Teriyaki Salmon', image: '/images/salmon.jpg', category: 'Bowls & Plates', primaryTaste: 'Fresh', price: 13.99, feeds: '5–7', dealType: 'BOGO', dealExpiresAt: hours(3), destinationUrl: 'https://www.ubereats.com', modifiers: { create: [] } },
          { name: 'Mochi Ice Cream', image: '/images/chocolate-cake.jpg', category: 'Dessert', primaryTaste: 'Sweet', price: 4.99, feeds: '3–4', dealType: 'Under $10', dealExpiresAt: hours(9), modifiers: { create: [] } },
          { name: 'Veggie Tempura', image: '/images/tacos.jpg', category: 'Snacky', primaryTaste: 'Crispy', price: 6.49, feeds: '5–7', dealType: 'Lunch Special', dealExpiresAt: hours(5), modifiers: { create: [{ name: 'Vegetarian' }] } },
          { name: 'Truffle Mac Bowl', image: '/images/mac-cheese.jpg', category: 'Comfort', primaryTaste: 'Cheesy', price: 8.99, feeds: '8–10', dealType: 'Late Night', dealExpiresAt: hours(14), modifiers: { create: [] } },
          { name: 'Wagyu Burger', image: '/images/burger.jpg', category: 'Handheld', primaryTaste: 'Cheesy', price: 11.99, feeds: '3–4', dealType: 'BOGO', dealExpiresAt: hours(2), modifiers: { create: [] } },
          { name: 'Neapolitan Pizza', image: '/images/pizza.jpg', category: 'Handheld', primaryTaste: 'Cheesy', price: 8.99, feeds: '10+', dealType: 'Under $10', dealExpiresAt: hours(6), modifiers: { create: [] } },
          { name: 'Herb-Crusted Steak', image: '/images/steak.jpg', category: 'Bowls & Plates', primaryTaste: 'Crispy', price: 16.99, feeds: '5–7', dealType: 'Late Night', dealExpiresAt: hours(11), modifiers: { create: [] } },
        ],
      },
    },
  });

  // Restaurant 3: Dolce Vita
  const r3 = await prisma.restaurant.create({
    data: {
      name: 'Dolce Vita',
      coverImage: '/images/pizza.jpg',
      redirectUrl: 'https://google.com',
      distance: 0.8,
      categories: {
        create: [
          { name: 'Handheld' },
          { name: 'Dessert' },
        ],
      },
      dishes: {
        create: [
          { name: 'Wood-Fired Margherita', image: '/images/pizza.jpg', category: 'Handheld', primaryTaste: 'Cheesy', price: 8.99, feeds: '10+', dealType: 'BOGO', dealExpiresAt: hours(6), destinationUrl: 'https://www.grubhub.com', modifiers: { create: [{ name: 'Vegetarian' }] } },
          { name: 'Tiramisu', image: '/images/chocolate-cake.jpg', category: 'Dessert', primaryTaste: 'Sweet', price: 5.49, feeds: '3–4', dealType: 'Under $10', dealExpiresAt: hours(8), modifiers: { create: [] } },
          { name: 'Seafood Linguine', image: '/images/salmon.jpg', category: 'Bowls & Plates', primaryTaste: 'Fresh', price: 12.99, feeds: '5–7', dealType: 'BOGO', dealExpiresAt: hours(3), destinationUrl: 'https://www.ubereats.com', modifiers: { create: [] } },
          { name: 'Burrata Salad', image: '/images/poke-bowl.jpg', category: 'Fresh & Light', primaryTaste: 'Fresh', price: 7.99, feeds: '3–4', dealType: 'Lunch Special', dealExpiresAt: hours(5), modifiers: { create: [{ name: 'Vegetarian' }] } },
          { name: 'Truffle Fries', image: '/images/mac-cheese.jpg', category: 'Snacky', primaryTaste: 'Crispy', price: 5.99, feeds: '8–10', dealType: 'Under $10', dealExpiresAt: hours(10), modifiers: { create: [] } },
          { name: 'Italian Burger', image: '/images/burger.jpg', category: 'Handheld', primaryTaste: 'Cheesy', price: 9.99, feeds: '3–4', dealType: 'Late Night', dealExpiresAt: hours(13), modifiers: { create: [] } },
          { name: 'Spicy Arrabbiata', image: '/images/pad-thai.jpg', category: 'Bowls & Plates', primaryTaste: 'Spicy', price: 7.49, feeds: '5–7', dealType: 'Under $10', dealExpiresAt: hours(7), modifiers: { create: [{ name: 'Vegan' }] } },
          { name: 'Grilled Branzino', image: '/images/steak.jpg', category: 'Bowls & Plates', primaryTaste: 'Fresh', price: 15.99, feeds: '3–4', dealType: 'BOGO', dealExpiresAt: hours(2), modifiers: { create: [] } },
          { name: 'Street Tacos', image: '/images/tacos.jpg', category: 'Handheld', primaryTaste: 'Spicy', price: 6.99, feeds: '10+', dealType: 'BOGO', dealExpiresAt: hours(4), modifiers: { create: [] } },
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

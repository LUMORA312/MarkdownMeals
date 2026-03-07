import { Restaurant } from '@/types/food';

// Helper: expiration timestamps relative to now
const hours = (h: number) => Date.now() + h * 60 * 60 * 1000;

export const restaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'The Flame & Grill',
    coverImage: '/images/burger.jpg',
    categories: ['Burgers & Sandwiches', 'Steak & Grill'],
    redirectUrl: 'https://example.com/flame-grill',
    dishes: [
      { id: 'd1', name: 'Classic Smash Burger', image: '/images/burger.jpg', category: 'Burgers & Sandwiches', primaryTaste: 'Savory', modifiers: [], price: 7.99, originalPrice: 12.99, dealType: 'Under $10', dealExpiresAt: hours(6) },
      { id: 'd2', name: 'Ribeye Steak', image: '/images/steak.jpg', category: 'Steak & Grill', primaryTaste: 'Savory', modifiers: [], price: 18.99, originalPrice: 28.99, dealType: 'BOGO', dealExpiresAt: hours(3) },
      { id: 'd3', name: 'Loaded Mac & Cheese', image: '/images/mac-cheese.jpg', category: 'Comfort Classics', primaryTaste: 'Cheesy', modifiers: [], price: 6.99, dealType: 'Under $10', dealExpiresAt: hours(8) },
      { id: 'd4', name: 'Fish Tacos', image: '/images/tacos.jpg', category: 'Mexican & Latin', primaryTaste: 'Crispy', modifiers: ['Spicy'], price: 9.49, originalPrice: 13.99, dealType: 'Lunch Special', dealExpiresAt: hours(4) },
      { id: 'd5', name: 'Chocolate Lava Cake', image: '/images/chocolate-cake.jpg', category: 'Desserts & Sweets', primaryTaste: 'Sweet', modifiers: [], price: 5.99, dealType: 'BOGO', dealExpiresAt: hours(5) },
      { id: 'd6', name: 'Grilled Salmon', image: '/images/salmon.jpg', category: 'Seafood', primaryTaste: 'Fresh', modifiers: [], price: 14.99, originalPrice: 22.00, dealType: 'BOGO', dealExpiresAt: hours(2) },
      { id: 'd7', name: 'Pad Thai', image: '/images/pad-thai.jpg', category: 'Asian', primaryTaste: 'Savory', modifiers: ['Spicy'], price: 8.99, dealType: 'Under $10', dealExpiresAt: hours(10) },
      { id: 'd8', name: 'Margherita Pizza', image: '/images/pizza.jpg', category: 'Pizza & Italian', primaryTaste: 'Cheesy', modifiers: ['Vegetarian'], price: 9.99, originalPrice: 14.99, dealType: 'Late Night', dealExpiresAt: hours(12) },
      { id: 'd9', name: 'Poke Bowl', image: '/images/poke-bowl.jpg', category: 'Salads & Bowls', primaryTaste: 'Fresh', modifiers: [], price: 8.49, dealType: 'Lunch Special', dealExpiresAt: hours(5) },
    ],
  },
  {
    id: 'r2',
    name: 'Sakura Kitchen',
    coverImage: '/images/pad-thai.jpg',
    categories: ['Asian', 'Salads & Bowls'],
    redirectUrl: 'https://example.com/sakura',
    dishes: [
      { id: 'd10', name: 'Spicy Pad Thai', image: '/images/pad-thai.jpg', category: 'Asian', primaryTaste: 'Savory', modifiers: ['Spicy'], price: 7.99, dealType: 'Under $10', dealExpiresAt: hours(7) },
      { id: 'd11', name: 'Salmon Poke Bowl', image: '/images/poke-bowl.jpg', category: 'Salads & Bowls', primaryTaste: 'Fresh', modifiers: [], price: 9.99, originalPrice: 15.99, dealType: 'BOGO', dealExpiresAt: hours(4) },
      { id: 'd12', name: 'Grilled Teriyaki Salmon', image: '/images/salmon.jpg', category: 'Seafood', primaryTaste: 'Savory', modifiers: [], price: 13.99, originalPrice: 19.99, dealType: 'BOGO', dealExpiresAt: hours(3) },
      { id: 'd13', name: 'Mochi Ice Cream', image: '/images/chocolate-cake.jpg', category: 'Desserts & Sweets', primaryTaste: 'Sweet', modifiers: [], price: 4.99, dealType: 'Under $10', dealExpiresAt: hours(9) },
      { id: 'd14', name: 'Veggie Tempura', image: '/images/tacos.jpg', category: 'Asian', primaryTaste: 'Crispy', modifiers: ['Vegetarian'], price: 6.49, dealType: 'Lunch Special', dealExpiresAt: hours(5) },
      { id: 'd15', name: 'Truffle Mac Bowl', image: '/images/mac-cheese.jpg', category: 'Comfort Classics', primaryTaste: 'Comfort', modifiers: [], price: 8.99, originalPrice: 13.99, dealType: 'Late Night', dealExpiresAt: hours(14) },
      { id: 'd16', name: 'Wagyu Burger', image: '/images/burger.jpg', category: 'Burgers & Sandwiches', primaryTaste: 'Savory', modifiers: [], price: 11.99, originalPrice: 18.99, dealType: 'BOGO', dealExpiresAt: hours(2) },
      { id: 'd17', name: 'Neapolitan Pizza', image: '/images/pizza.jpg', category: 'Pizza & Italian', primaryTaste: 'Cheesy', modifiers: [], price: 8.99, dealType: 'Under $10', dealExpiresAt: hours(6) },
      { id: 'd18', name: 'Herb-Crusted Steak', image: '/images/steak.jpg', category: 'Steak & Grill', primaryTaste: 'Savory', modifiers: [], price: 16.99, originalPrice: 26.99, dealType: 'Late Night', dealExpiresAt: hours(11) },
    ],
  },
  {
    id: 'r3',
    name: 'Dolce Vita',
    coverImage: '/images/pizza.jpg',
    categories: ['Pizza & Italian', 'Desserts & Sweets'],
    redirectUrl: 'https://example.com/dolce-vita',
    dishes: [
      { id: 'd19', name: 'Wood-Fired Margherita', image: '/images/pizza.jpg', category: 'Pizza & Italian', primaryTaste: 'Cheesy', modifiers: ['Vegetarian'], price: 8.99, originalPrice: 14.99, dealType: 'BOGO', dealExpiresAt: hours(6) },
      { id: 'd20', name: 'Tiramisu', image: '/images/chocolate-cake.jpg', category: 'Desserts & Sweets', primaryTaste: 'Sweet', modifiers: [], price: 5.49, dealType: 'Under $10', dealExpiresAt: hours(8) },
      { id: 'd21', name: 'Seafood Linguine', image: '/images/salmon.jpg', category: 'Seafood', primaryTaste: 'Fresh', modifiers: [], price: 12.99, originalPrice: 19.99, dealType: 'BOGO', dealExpiresAt: hours(3) },
      { id: 'd22', name: 'Burrata Salad', image: '/images/poke-bowl.jpg', category: 'Salads & Bowls', primaryTaste: 'Fresh', modifiers: ['Vegetarian'], price: 7.99, dealType: 'Lunch Special', dealExpiresAt: hours(5) },
      { id: 'd23', name: 'Truffle Fries', image: '/images/mac-cheese.jpg', category: 'Comfort Classics', primaryTaste: 'Crispy', modifiers: [], price: 5.99, dealType: 'Under $10', dealExpiresAt: hours(10) },
      { id: 'd24', name: 'Italian Burger', image: '/images/burger.jpg', category: 'Burgers & Sandwiches', primaryTaste: 'Savory', modifiers: [], price: 9.99, originalPrice: 14.99, dealType: 'Late Night', dealExpiresAt: hours(13) },
      { id: 'd25', name: 'Spicy Arrabbiata', image: '/images/pad-thai.jpg', category: 'Pizza & Italian', primaryTaste: 'Savory', modifiers: ['Spicy', 'Vegan'], price: 7.49, dealType: 'Under $10', dealExpiresAt: hours(7) },
      { id: 'd26', name: 'Grilled Branzino', image: '/images/steak.jpg', category: 'Seafood', primaryTaste: 'Fresh', modifiers: [], price: 15.99, originalPrice: 24.99, dealType: 'BOGO', dealExpiresAt: hours(2) },
      { id: 'd27', name: 'Street Tacos', image: '/images/tacos.jpg', category: 'Mexican & Latin', primaryTaste: 'Savory', modifiers: ['Spicy'], price: 6.99, dealType: 'BOGO', dealExpiresAt: hours(4) },
    ],
  },
];

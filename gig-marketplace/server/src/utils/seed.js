require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');
const { User, Category, Gig, Order, Review } = require('../models');

async function seed() {
  await sequelize.sync({ force: true }); // WARNING: drops and recreates tables

  const passwordHash = await bcrypt.hash('password123', 10);

  const alice = await User.create({
    name: 'Alice Dev',
    email: 'alice@example.com',
    passwordHash,
    title: 'Full-stack developer',
    bio: '5 years building web apps with React and Node.',
  });

  const bob = await User.create({
    name: 'Bob Design',
    email: 'bob@example.com',
    passwordHash,
    title: 'Logo & brand designer',
    bio: 'I design clean, minimal logos for startups.',
  });

  const carol = await User.create({
    name: 'Carol Client',
    email: 'carol@example.com',
    passwordHash,
    title: null,
    bio: null,
  });

  const dev = await Category.create({ name: 'Development' });
  const design = await Category.create({ name: 'Design' });

  const gig1 = await Gig.create({
    title: 'I will build a responsive React website',
    description: 'Full responsive site with React + Tailwind, up to 5 pages.',
    price: 250,
    deliveryDays: 5,
    freelancerId: alice.id,
    categoryId: dev.id,
  });

  const gig2 = await Gig.create({
    title: 'I will design a modern minimalist logo',
    description: '3 initial concepts, unlimited revisions on the chosen one.',
    price: 80,
    deliveryDays: 3,
    freelancerId: bob.id,
    categoryId: design.id,
  });

  const order1 = await Order.create({
    gigId: gig2.id,
    buyerId: carol.id,
    price: gig2.price,
    requirements: 'Something clean, blue color scheme, tech startup vibe.',
    status: 'completed',
  });

  await Review.create({
    orderId: order1.id,
    reviewerId: carol.id,
    rating: 5,
    comment: 'Bob delivered exactly what I wanted, fast turnaround!',
  });

  console.log('Seed complete.');
  console.log('Logins (all use password: password123):');
  console.log('  alice@example.com (freelancer - dev)');
  console.log('  bob@example.com (freelancer - design)');
  console.log('  carol@example.com (client)');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();
await connectDB();

const sampleProducts = [
  {
    name: { ru: 'Шёлковый платок "Роза"', uz: 'Ipak ro\'mol "Atirgul"' },
    description: { ru: 'Роскошный платок из натурального шёлка с изысканным цветочным принтом. Идеален для особых случаев.', uz: 'Nozik gul naqshli tabiiy ipakdan hashamatli ro\'mol. Maxsus tadbirlar uchun ideal.' },
    slug: 'shelkovyy-platok-roza',
    sku: 'LP-SLK-001',
    category: 'platok',
    material: 'silk',
    pattern: 'floral',
    colors: [
      { name: 'Розовый', hex: '#E8A2B5', images: [], stock: 25 },
      { name: 'Кремовый', hex: '#F5F0E8', images: [], stock: 18 },
      { name: 'Бежевый', hex: '#D4B896', images: [], stock: 12 },
    ],
    sizes: [{ label: '90×90 см', dimensions: '90x90' }, { label: '100×100 см', dimensions: '100x100' }],
    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800'],
    retailPrice: 185000,
    compareAtPrice: 220000,
    wholesaleTiers: [
      { minQuantity: 10, maxQuantity: 29, pricePerUnit: 148000, label: '10-29 шт.' },
      { minQuantity: 30, maxQuantity: 99, pricePerUnit: 128000, label: '30-99 шт.' },
      { minQuantity: 100, pricePerUnit: 110000, label: 'от 100 шт.' },
    ],
    stock: 55,
    isFeatured: true,
    isBestSeller: true,
    badges: ['premium', 'breathable'],
    tags: ['шёлк', 'платок', 'цветочный', 'luxury'],
  },
  {
    name: { ru: 'Шифоновый хиджаб "Нежность"', uz: 'Shifon hijob "Noziklik"' },
    description: { ru: 'Воздушный хиджаб из премиального шифона. Дышащий материал — идеален для жаркого климата Ташкента.', uz: 'Premium shifondan nafis hijob. Nafas oladigan material — Toshkentning issiq iqlimi uchun ideal.' },
    slug: 'shifonovyy-khidzhab-nezhnost',
    sku: 'LP-CHF-001',
    category: 'hijab',
    material: 'chiffon',
    pattern: 'solid',
    colors: [
      { name: 'Белый', hex: '#FFFFFF', images: [], stock: 40 },
      { name: 'Чёрный', hex: '#1A1A1A', images: [], stock: 35 },
      { name: 'Розовый', hex: '#E8A2B5', images: [], stock: 28 },
      { name: 'Серый', hex: '#9A9A9A', images: [], stock: 20 },
    ],
    images: ['https://images.unsplash.com/photo-1550534791-2677533605ab?w=800'],
    retailPrice: 95000,
    wholesaleTiers: [
      { minQuantity: 10, maxQuantity: 49, pricePerUnit: 76000, label: '10-49 шт.' },
      { minQuantity: 50, pricePerUnit: 62000, label: 'от 50 шт.' },
    ],
    stock: 123,
    isNewArrival: true,
    isBestSeller: true,
    badges: ['breathable', 'premium'],
    tags: ['шифон', 'хиджаб', 'однотонный'],
  },
  {
    name: { ru: 'Жоржетовая шаль "Элегант"', uz: 'Jorjet shal "Elegant"' },
    description: { ru: 'Роскошная шаль из жоржета с золотой каймой. Безупречный выбор для вечерних образов.', uz: 'Oltin chiziqli jorjet shal. Kechki tasvirlar uchun mukammal tanlov.' },
    slug: 'zhorzhetovaya-shal-elegant',
    sku: 'LP-GRG-001',
    category: 'shawl',
    material: 'georgette',
    pattern: 'solid',
    colors: [
      { name: 'Золотой', hex: '#C9A96E', images: [], stock: 15 },
      { name: 'Бордо', hex: '#722F37', images: [], stock: 10 },
      { name: 'Тёмно-синий', hex: '#1B2A6B', images: [], stock: 12 },
    ],
    images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800'],
    retailPrice: 245000,
    compareAtPrice: 290000,
    wholesaleTiers: [
      { minQuantity: 10, maxQuantity: 29, pricePerUnit: 196000, label: '10-29 шт.' },
      { minQuantity: 30, pricePerUnit: 172000, label: 'от 30 шт.' },
    ],
    stock: 37,
    isFeatured: true,
    badges: ['premium', 'exclusive'],
    tags: ['жоржет', 'шаль', 'вечерний'],
  },
  {
    name: { ru: 'Хлопковый платок "Лето"', uz: 'Paxta ro\'mol "Yoz"' },
    description: { ru: 'Лёгкий хлопковый платок с геометрическим принтом. Практичный выбор для повседневных образов.', uz: 'Geometrik naqshli engil paxta ro\'mol. Kundalik tasvirlar uchun amaliy tanlov.' },
    slug: 'khlopkovyy-platok-leto',
    sku: 'LP-CTN-001',
    category: 'platok',
    material: 'cotton',
    pattern: 'geometric',
    colors: [
      { name: 'Мятный', hex: '#98D8C8', images: [], stock: 30 },
      { name: 'Лавандовый', hex: '#D8B4E2', images: [], stock: 25 },
    ],
    images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800'],
    retailPrice: 65000,
    wholesaleTiers: [
      { minQuantity: 10, pricePerUnit: 52000, label: '10+ шт.' },
      { minQuantity: 50, pricePerUnit: 45000, label: '50+ шт.' },
    ],
    stock: 55,
    isNewArrival: true,
    badges: ['breathable'],
    tags: ['хлопок', 'платок', 'геометрический', 'лето'],
  },
];

const seedDB = async () => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log('✨ Database seeded with sample products!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();

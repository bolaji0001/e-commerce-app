import { pool } from "./pool";

const products = [
  { slug: "everyday-backpack", name: "Everyday Backpack", description: "Water-resistant 20L backpack with a laptop sleeve.", price_cents: 5900, stock: 40 },
  { slug: "insulated-bottle", name: "Insulated Water Bottle", description: "750 ml stainless steel bottle that keeps drinks cold for 24 hours.", price_cents: 2800, stock: 120 },
  { slug: "wireless-earbuds", name: "Wireless Earbuds", description: "Bluetooth earbuds with a charging case and 20 hours of battery.", price_cents: 7900, stock: 60 },
  { slug: "desk-lamp", name: "LED Desk Lamp", description: "Dimmable lamp with three colour temperatures and a USB port.", price_cents: 3400, stock: 35 },
  { slug: "notebook-set", name: "Notebook Set (3 pack)", description: "A5 dotted notebooks with a lay-flat binding.", price_cents: 1800, stock: 200 },
  { slug: "running-shoes", name: "Lightweight Running Shoes", description: "Breathable mesh trainers for daily runs.", price_cents: 11900, stock: 25 },
  { slug: "yoga-mat", name: "Non-Slip Yoga Mat", description: "6 mm cushioned mat with a carrying strap.", price_cents: 3900, stock: 50 },
  { slug: "coffee-grinder", name: "Manual Coffee Grinder", description: "Adjustable ceramic burr grinder for pour-over and espresso.", price_cents: 4500, stock: 30 },
  { slug: "phone-stand", name: "Aluminium Phone Stand", description: "Foldable stand that fits phones and small tablets.", price_cents: 1500, stock: 150 },
  { slug: "mechanical-keyboard", name: "Mechanical Keyboard", description: "Compact 75% keyboard with hot-swappable switches.", price_cents: 9900, stock: 20 },
  { slug: "canvas-tote", name: "Canvas Tote Bag", description: "Heavy-duty cotton tote with an inside pocket.", price_cents: 2200, stock: 90 },
  { slug: "travel-mug", name: "Leak-Proof Travel Mug", description: "Double-wall 450 ml mug that fits most cup holders.", price_cents: 2400, stock: 80 },
];

async function main() {
  for (const p of products) {
    await pool.query(
      `insert into products (slug, name, description, price_cents, image_url, stock)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (slug) do nothing`,
      [p.slug, p.name, p.description, p.price_cents, `https://picsum.photos/seed/${p.slug}/600/400`, p.stock]
    );
  }
  console.log(`seeded ${products.length} products`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
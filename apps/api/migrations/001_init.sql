create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  total_cents integer not null check (total_cents >= 0),
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);
create index orders_user_id_idx on orders(user_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);
create index order_items_order_id_idx on order_items(order_id);
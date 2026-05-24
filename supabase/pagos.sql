-- Tabla pagos
create table if not exists pagos (
  id uuid default gen_random_uuid() primary key,
  contrato_id uuid not null references contratos(id) on delete cascade,
  fecha date not null default current_date,
  monto numeric not null,
  metodo text not null check (metodo in ('efectivo', 'transferencia')),
  anotacion text,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table pagos enable row level security;

create policy "Autenticados pueden leer pagos" on pagos
  for select using (auth.role() = 'authenticated');

create policy "Autenticados pueden insertar pagos" on pagos
  for insert with check (auth.role() = 'authenticated');

create policy "Autenticados pueden eliminar pagos" on pagos
  for delete using (auth.role() = 'authenticated');

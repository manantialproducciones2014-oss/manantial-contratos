-- Tabla contratos
create table if not exists contratos (
  id uuid default gen_random_uuid() primary key,
  numero text unique not null,
  fecha date not null default current_date,
  tipo_evento text not null check (tipo_evento in ('XV Años', 'Boda', 'Empresarial')),
  combo_snapshot jsonb,
  adicionales_snapshot jsonb not null default '[]',
  cliente_nombre text not null,
  cliente_direccion text,
  cliente_localidad text,
  cliente_cp text,
  cliente_dni text not null,
  cliente_telefono text not null,
  cliente_email text,
  evento_nombre text,
  evento_fecha date,
  evento_lugar text,
  evento_direccion text,
  evento_duracion text,
  evento_invitados text,
  evento_horario_desde text,
  evento_horario_hasta text,
  total numeric not null,
  metodo_pago text not null check (metodo_pago in ('efectivo', 'transferencia')),
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table contratos enable row level security;

create policy "Autenticados pueden leer contratos" on contratos
  for select using (auth.role() = 'authenticated');

create policy "Autenticados pueden insertar contratos" on contratos
  for insert with check (auth.role() = 'authenticated');

create policy "Autenticados pueden actualizar contratos" on contratos
  for update using (auth.role() = 'authenticated');

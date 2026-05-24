-- Tabla combos
create table if not exists combos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  tipo text not null check (tipo in ('XV Años', 'Boda', 'Adicional')),
  precio numeric not null,
  cuotas_cantidad int not null default 3,
  cuotas_monto numeric not null,
  servicios text[] not null default '{}',
  activo boolean not null default true,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table combos enable row level security;

create policy "Autenticados pueden leer combos" on combos
  for select using (auth.role() = 'authenticated');

create policy "Autenticados pueden insertar combos" on combos
  for insert with check (auth.role() = 'authenticated');

create policy "Autenticados pueden actualizar combos" on combos
  for update using (auth.role() = 'authenticated');

-- Seed: XV Años
insert into combos (nombre, tipo, precio, cuotas_cantidad, cuotas_monto, servicios) values
('Pack Básico', 'XV Años', 990000, 3, 330000, ARRAY[
  'Cobertura Completa de FOTO Y VIDEO (Fotos Ilimitadas)',
  '1 Filmador y 1 Fotógrafo Profesional',
  'Edición y musicalización de la fiesta',
  'Entrega en Link de Descarga (Alta Calidad HD)'
]),
('Pack Medio', 'XV Años', 1200000, 3, 400000, ARRAY[
  'Cobertura Completa de FOTO Y VIDEO (Fotos Ilimitadas)',
  '1 Filmador y 1 Fotógrafo Profesional',
  'Edición y musicalización de la fiesta',
  'Sesión de Fotos en Exteriores o Estudio',
  'Libro de Fotos (5 hojas tapa blanda)',
  'Clip Cronológico',
  'Entrega en Link de Descarga (Alta Calidad HD)'
]),
('Pack Completo', 'XV Años', 1550000, 3, 520000, ARRAY[
  'Cobertura Completa de FOTO Y VIDEO (Fotos Ilimitadas)',
  '1 Filmador y 1 Fotógrafo Profesional',
  'Edición y musicalización de la fiesta',
  'Sesión de Fotos en Exteriores o Estudio',
  'Video Backstage',
  'Libro de Firmas (5 hojas tapa blanda)',
  'Clip Cronológico',
  'Fotolibro (Tapa Dura 10 HOJAS 30X45 cm)',
  'Mural (60x40) o Gigantografía',
  'Entrega Material en PENDRIVE'
]),
('Pack Premium', 'XV Años', 1850000, 3, 620000, ARRAY[
  'Cobertura Completa de FOTO Y VIDEO (Fotos Ilimitadas)',
  '1 Filmador y 1 Fotógrafo Profesional',
  'Edición y musicalización de la fiesta',
  'Sesión de Fotos en Exteriores o Estudio',
  'Video Backstage',
  'Libro de Firmas (5 hojas tapa blanda)',
  'Clip Cronológico',
  'Fotolibro (Tapa Dura 10 HOJAS 30X45 cm)',
  'Entrega Material en PENDRIVE',
  'Esquinero con Fotos (1.50x1m)',
  'Resumen de Fiesta para subir a Redes',
  'Plataforma 360 o Espejo Mágico'
]);

-- Seed: Bodas
insert into combos (nombre, tipo, precio, cuotas_cantidad, cuotas_monto, servicios) values
('Pack Básico (Cobertura en la Noche)', 'Boda', 990000, 3, 330000, ARRAY[
  'Cobertura Completa de FOTO Y VIDEO (Fotos Ilimitadas)',
  '1 Filmador y 1 Fotógrafo Profesional',
  'Edición y musicalización de la fiesta',
  'Entrega Material en Link de Descarga (Alta Calidad HD)'
]),
('Pack Completo', 'Boda', 1500000, 3, 500000, ARRAY[
  'Cobertura Completa de FOTO Y VIDEO (Fotos Ilimitadas)',
  '1 Filmador y 1 Fotógrafo Profesional',
  'Edición y musicalización de la fiesta',
  'Foto y video — momentos previos de boda (Novia)',
  'Cobertura Ceremonia',
  'Sesión de Fotos en Exteriores o Estudio',
  '20 Fotos Polaroid impresas',
  'Resumen de Fiesta para subir a redes',
  'Entrega Material en PENDRIVE'
]);

-- Seed: Adicionales
insert into combos (nombre, tipo, precio, cuotas_cantidad, cuotas_monto, servicios) values
('Civil Foto', 'Adicional', 60000, 1, 60000, ARRAY['Cobertura fotográfica civil']),
('Civil Foto & Video', 'Adicional', 100000, 1, 100000, ARRAY['Cobertura foto y video civil']),
('Plataforma 360', 'Adicional', 250000, 1, 250000, ARRAY['Plataforma 360']),
('Espejo Mágico', 'Adicional', 250000, 1, 250000, ARRAY['Espejo Mágico']),
('Resumen de Fiesta (en vivo)', 'Adicional', 300000, 1, 300000, ARRAY['Resumen de Fiesta para subir a Redes (en vivo)']),
('Cuadro Mural Canva (60x40)', 'Adicional', 80000, 1, 80000, ARRAY['Cuadro Mural Canva 60x40 cm']);

# Manantial Contratos

## ¿Qué es esto?
App web para gestionar contratos, pagos y galería de Manantial Producciones.
Permite crear contratos seleccionando combos prediseñados, registrar pagos
parciales, imprimir el contrato en PDF, y administrar una galería de trabajos
que se muestra públicamente en el portfolio y en la web institucional.

## Stack
- Frontend + Backend: Next.js 14 con App Router, TypeScript, Tailwind CSS
- Base de datos + Auth: Supabase (PostgreSQL)
- Deploy: Vercel
- PDF: página /pdf renderizada para impresión con window.print()
- Google Drive: googleapis (service account) para importar fotos de carpetas

## Estructura del proyecto
/
├── app/
│   ├── (auth)/login/              → página de login
│   ├── (app)/                     → rutas protegidas
│   │   ├── page.tsx               → historial de contratos
│   │   ├── nuevo/                 → crear contrato
│   │   ├── contratos/[id]/        → detalle + pagos
│   │   ├── contratos/[id]/pdf/    → vista imprimible
│   │   ├── combos/                → gestión de combos
│   │   └── galeria/               → admin de galería (CRUD + importar Drive)
│   ├── portfolio/                 → portfolio público (sin auth)
│   │   ├── page.tsx               → Server Component con font Playfair Display
│   │   └── PortfolioClient.tsx    → filtros por categoría/mes, lightbox
│   ├── api/
│   │   ├── galeria/public/        → GET público con CORS (usado por la web)
│   │   └── galeria/preview/[fileId]/ → proxy de imágenes desde Google Drive
│   ├── actions/
│   │   └── galeria.ts             → CRUD de galería + integración Google Drive
│   └── layout.tsx
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── galeria-helpers.ts         → helpers de fecha/mes para el portfolio
└── CLAUDE.md

## Base de datos

### combos
- id (uuid, PK)
- nombre (text)
- precio (numeric)
- cuotas_cantidad (int)
- cuotas_monto (numeric)
- servicios (text[]) — array de strings
- activo (boolean, default true)
- created_at (timestamp)

### contratos
- id (uuid, PK)
- numero (text, único) — formato: "2026-001"
- fecha (date)
- tipo_evento (text) — 'XV Años' | 'Boda' | 'Empresarial'
- combo_snapshot (jsonb) — copia del combo al momento de crear
- cliente_nombre, cliente_direccion, cliente_localidad,
  cliente_cp, cliente_dni, cliente_telefono, cliente_email (text)
- evento_nombre, evento_fecha, evento_lugar, evento_direccion,
  evento_duracion, evento_invitados, evento_horario_desde,
  evento_horario_hasta (text/date)
- total (numeric)
- metodo_pago (text) — 'efectivo' | 'transferencia'
- created_at (timestamp)

### pagos
- id (uuid, PK)
- contrato_id (uuid, FK → contratos)
- fecha (date)
- monto (numeric)
- metodo (text) — 'efectivo' | 'transferencia'
- anotacion (text)
- created_at (timestamp)

### galeria
- id (uuid, PK)
- titulo (text) — ej: "Sofía García - XV Años"
- categoria (text) — ver categorías abajo
- fotos (text[]) — array de URLs relativas a /api/galeria/preview/[fileId]
- fecha (date) — fecha del evento
- descripcion (text, nullable)
- orden (int) — para ordenamiento manual (no implementado en UI aún)
- activo (boolean) — si aparece en el portfolio público
- created_at (timestamp)

## Categorías de galería
- `xv` → XV Años (bodas en quince.html de la web)
- `boda` → Boda (bodas.html)
- `empresarial` → Empresarial
- `sesiones` → Sesiones (sesiones.html)
- `videografia` → Videografía (videografia.html)
- `espejo` → Espejo Mágico (espejo.html)
- `plataforma360` → Plataforma 360° (plataforma360.html)

## Flujo de la galería
1. Desde /galeria (admin), importás una carpeta de Google Drive con link
2. La app lee los archivos con la API de Drive (service account)
3. Guarda las URLs como /api/galeria/preview/[fileId] en Supabase
4. El proxy /api/galeria/preview/[fileId] sirve las imágenes autenticando con Drive
5. El portfolio público /portfolio muestra las galerías activas
6. La web institucional (manantial-web) consume /api/galeria/public con CORS
   para mostrar fotos en cada página según categoría

## Web institucional (proyecto separado)
Repo: github.com/manantialproducciones2014-oss/manantial-web
URL: manantial-web.manantialproducciones2014.workers.dev
Stack: HTML/CSS/JS estático en Cloudflare Workers

Conexión con esta app:
- index.html → sección "Últimos Eventos" carga los 6 más recientes de /api/galeria/public
- bodas.html, quince.html, sesiones.html, etc. → cargan fotos de su categoría via js/galeria-dinamica.js
- El navbar tiene link a /portfolio de esta app

## Galería privada de cliente (feature pendiente)
galeria-cliente.html en la web permite que un cliente acceda a su sesión
de fotos completa con un código de acceso privado. El cliente ingresa su
código, ve todas sus fotos y puede descargarlas. Actualmente usa galerias.js
en el frontend — necesita backend para manejar los códigos y las galerías
privadas (no mezcladas con la galería pública).
Pendiente: conectar esto con Supabase para que los códigos se generen
desde esta app al crear/entregar un evento.

## Términos y condiciones
"El Cliente reconoce y acuerda que la Empresa se reserva el derecho
de utilizar dichas imágenes y video en cualquier momento y cualquier
ocasión. El pago del anticipo es reembolsable (I) en un 80% cuando
el presente Contrato sea cancelado con 6 (seis) meses de anticipación
a la fecha del Evento, (ii) en un 50% cuando el presente Contrato sea
cancelado con 3 (tres) meses de anticipación, posterior a esta fecha
de Evento, no tendrán reembolso alguno."

## Responsable del evento (datos fijos)
Nombre: Andres Zapata — DNI: 36010684
Teléfono: 341 3125437
Empresa: Manantial Producciones — Rosario

## Numeración de contratos
Formato: YYYY-NNN (ej: 2026-001)
El número se genera automáticamente al crear un contrato.

## Colores de la marca
- Negro: #0A0A0A
- Dorado: #C8A951
- Crema: #F5F0E8

## Convenciones
- Usar async/await, nunca .then()
- Server Components por defecto, "use client" solo cuando sea necesario
- Todos los montos en numeric, mostrar con separadores de miles (Intl.NumberFormat)
- El combo_snapshot guarda el combo completo al crear el contrato
  para que cambios futuros en el combo no afecten contratos viejos
- Las fotos en galeria se guardan como rutas relativas /api/galeria/preview/[id]
  para que el proxy de Drive funcione tanto en dev como en prod

## Variables de entorno
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_DRIVE_SERVICE_ACCOUNT=   ← JSON de la service account (stringificado)
GOOGLE_DRIVE_FOLDER_ID=         ← ID de la carpeta raíz de Drive (para el picker del admin)

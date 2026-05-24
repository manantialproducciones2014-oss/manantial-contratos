# Manantial Contratos

## ¿Qué es esto?
App web para gestionar contratos y pagos de Manantial Producciones.
Permite crear contratos seleccionando combos prediseñados, registrar
pagos parciales de clientes e imprimir el contrato actualizado en PDF.

## Stack
- Frontend + Backend: Next.js 14 con App Router, TypeScript, Tailwind CSS
- Base de datos + Auth: Supabase (PostgreSQL)
- Deploy: Vercel
- PDF: página /pdf renderizada para impresión con window.print()

## Estructura del proyecto
/
├── app/
│   ├── (auth)/login/         → página de login
│   ├── (app)/                → rutas protegidas
│   │   ├── page.tsx          → historial de contratos
│   │   ├── nuevo/            → crear contrato
│   │   ├── contratos/[id]/   → detalle + pagos
│   │   ├── contratos/[id]/pdf/ → vista imprimible
│   │   └── combos/           → gestión de combos
│   └── layout.tsx
├── components/
│   ├── ui/                   → botones, inputs, modales
│   └── contrato/             → formulario, tabla pagos, pdf
├── lib/
│   ├── supabase.ts
│   └── utils.ts
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

## Variables de entorno
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

## Arquitectura
El flujo de datos es simple. Todo vive en Supabase. Next.js conecta desde el servidor usando las credenciales de Supabase y muestra los datos. No hay lógica compleja en el cliente.

Cuando creás un contrato, el combo se copia completo en combo_snapshot — así si en el futuro cambiás el precio del combo, los contratos viejos quedan intactos con el precio original.

El PDF no es un archivo — es una página web con CSS de impresión. Cuando abrís /contratos/[id]/pdf el navegador la muestra lista para imprimir. Cada vez que la abrís tiene los pagos actualizados.

## Fases de desarrollo

### Fase 1 — Setup y login
Objetivo: el proyecto existe, está conectado a Supabase y solo vos podés entrar.
Entregable: podés hacer login con tu mail y ver una pantalla vacía.

### Fase 2 — Gestión de combos
Objetivo: podés crear, editar y desactivar combos desde /combos.
Entregable: cargás tus 4 combos y los ves listados.

### Fase 3 — Crear contrato
Objetivo: formulario completo en /nuevo que guarda en Supabase.
Entregable: creás un contrato, aparece en el historial con número 2026-001.

### Fase 4 — Pagos
Objetivo: dentro de cada contrato podés registrar pagos y ver saldo pendiente.
Entregable: agregás 3 pagos a un contrato y el saldo se actualiza.

### Fase 5 — PDF
Objetivo: /contratos/[id]/pdf muestra el contrato completo con pagos, listo para imprimir.
Entregable: imprimís un contrato y queda igual o mejor que el Word actual.

### Fase 6 — Deploy
Objetivo: la app está en internet en una URL de Vercel.
Entregable: abrís la URL desde el celular y funciona.

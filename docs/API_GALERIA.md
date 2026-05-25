# API Galería - Documentación

## Descripción

API pública para acceder a las galerías de fotos de Manantial Contratos. Permite a sitios externos (como manantial-web) consumir los datos de galerías de eventos.

**Endpoint Base:** `https://contratos.manantial.ar/api/galeria/public`

**Método:** `GET`

---

## Query Parameters

### `categoria` (opcional)
Filtra galerías por categoría de evento.

**Valores permitidos:**
- `xv` - XV Años
- `boda` - Bodas
- `empresarial` - Empresariales
- Omitir o no especificar para obtener todas las categorías

**Ejemplo:** `?categoria=xv`

### `limit` (opcional)
Cantidad máxima de galerías a retornar.

**Valores:**
- Mínimo: 1
- Máximo: 100
- Default: 50

**Ejemplo:** `?limit=20`

### `offset` (opcional)
Número de galerías a saltar (para paginación).

**Valores:**
- Mínimo: 0
- Default: 0

**Ejemplo:** `?offset=50` (retorna galerías 51-100)

---

## Ejemplos de Uso

### Obtener todas las galerías
```
GET https://contratos.manantial.ar/api/galeria/public
```

### Obtener solo galerías de XV Años
```
GET https://contratos.manantial.ar/api/galeria/public?categoria=xv
```

### Obtener 10 galerías de Bodas
```
GET https://contratos.manantial.ar/api/galeria/public?categoria=boda&limit=10
```

### Paginación: primeras 20, después las siguientes 20
```
GET https://contratos.manantial.ar/api/galeria/public?limit=20&offset=0
GET https://contratos.manantial.ar/api/galeria/public?limit=20&offset=20
```

---

## Respuesta

### Formato JSON

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "titulo": "Sofia Garcia - XV Años",
        "categoria": "xv",
        "fecha": "2026-05-25",
        "descripcion": "Fiesta de XV años de Sofia. Tema: flores blancas y doradas.",
        "fotos": [
          "/api/galeria/preview/file1",
          "/api/galeria/preview/file2",
          "/api/galeria/preview/file3"
        ],
        "previewUrl": "/api/galeria/preview/file1",
        "photoCount": 27,
        "createdAt": "2026-05-25T15:30:00Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "titulo": "Boda Juan y Maria",
        "categoria": "boda",
        "fecha": "2026-05-20",
        "descripcion": null,
        "fotos": [
          "/api/galeria/preview/file4",
          "/api/galeria/preview/file5"
        ],
        "previewUrl": "/api/galeria/preview/file4",
        "photoCount": 2,
        "createdAt": "2026-05-20T10:15:00Z"
      }
    ],
    "total": 52,
    "limit": 50,
    "offset": 0,
    "timestamp": "2026-05-25T16:45:30.123Z"
  }
}
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Indica si la solicitud fue exitosa |
| `data.items` | array | Array de galerías |
| `data.items[].id` | string | ID único de la galería (UUID) |
| `data.items[].titulo` | string | Nombre/título de la galería |
| `data.items[].categoria` | string | Categoría ('xv', 'boda', 'empresarial') |
| `data.items[].fecha` | string | Fecha del evento (formato YYYY-MM-DD) |
| `data.items[].descripcion` | string \| null | Descripción opcional |
| `data.items[].fotos` | string[] | Array de URLs de fotos |
| `data.items[].previewUrl` | string \| null | URL de la primera foto (para thumbnail) |
| `data.items[].photoCount` | number | Cantidad total de fotos |
| `data.items[].createdAt` | string | Timestamp de creación |
| `data.total` | number | Total de galerías disponibles (sin paginación) |
| `data.limit` | number | Límite usado en esta solicitud |
| `data.offset` | number | Offset usado en esta solicitud |
| `data.timestamp` | string | Timestamp de la respuesta |

---

## URLs de Fotos

Las fotos se retornan con URLs relativas como `/api/galeria/preview/{fileId}`.

Para usarlas en HTML/JavaScript, necesitas construir la URL completa:

```javascript
const baseUrl = 'https://contratos.manantial.ar'
const imageUrl = baseUrl + item.previewUrl // https://contratos.manantial.ar/api/galeria/preview/...
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 400 | Bad Request - Parámetros inválidos |
| 500 | Server Error - Error interno del servidor |

---

## Ejemplo Completo: Integración en Sitio Web

### HTML + JavaScript

```html
<!DOCTYPE html>
<html>
<head>
    <title>Galerías - Manantial Producciones</title>
    <style>
        .galeria-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 30px;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .galeria-item {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        .galeria-item:hover {
            transform: translateY(-10px);
        }
        
        .galeria-image {
            width: 100%;
            height: 300px;
            object-fit: cover;
            background: #ddd;
        }
        
        .galeria-info {
            padding: 20px;
            background: rgba(0,0,0,0.8);
            color: #C8A951;
        }
        
        .galeria-title {
            font-size: 1.2em;
            margin-bottom: 5px;
            color: #C8A951;
        }
        
        .galeria-meta {
            font-size: 0.9em;
            color: #F5F0E8;
        }
        
        .category-filter {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        
        .filter-btn {
            padding: 15px 30px;
            border: 2px solid #C8A951;
            background: #F5F0E8;
            color: #0A0A0A;
            cursor: pointer;
            border-radius: 5px;
            font-weight: 600;
            transition: all 0.3s;
        }
        
        .filter-btn.active {
            background: #C8A951;
            color: #F5F0E8;
        }
    </style>
</head>
<body>
    <h1 style="text-align: center; margin: 40px 0;">Nuestros Trabajos</h1>
    
    <!-- Filtros de categoría -->
    <div class="category-filter">
        <button class="filter-btn active" onclick="filterByCategory('all')">Todos</button>
        <button class="filter-btn" onclick="filterByCategory('xv')">XV Años</button>
        <button class="filter-btn" onclick="filterByCategory('boda')">Bodas</button>
        <button class="filter-btn" onclick="filterByCategory('empresarial')">Empresariales</button>
    </div>
    
    <!-- Contenedor de galerías -->
    <div class="galeria-container" id="galeria-container"></div>
    
    <script>
        const API_BASE = 'https://contratos.manantial.ar'
        const API_ENDPOINT = `${API_BASE}/api/galeria/public`
        let currentCategory = 'all'
        
        async function loadGalerias(categoria = 'all') {
            try {
                const url = categoria && categoria !== 'all' 
                    ? `${API_ENDPOINT}?categoria=${categoria}`
                    : API_ENDPOINT
                
                const response = await fetch(url)
                const result = await response.json()
                
                if (!result.success) {
                    console.error('Error:', result.error)
                    return
                }
                
                const container = document.getElementById('galeria-container')
                container.innerHTML = ''
                
                result.data.items.forEach(item => {
                    const imageUrl = item.previewUrl ? `${API_BASE}${item.previewUrl}` : ''
                    
                    const card = document.createElement('div')
                    card.className = 'galeria-item'
                    card.innerHTML = `
                        <img src="${imageUrl}" alt="${item.titulo}" class="galeria-image">
                        <div class="galeria-info">
                            <div class="galeria-title">${item.titulo}</div>
                            <div class="galeria-meta">
                                ${item.fecha} — ${item.photoCount} fotos
                            </div>
                        </div>
                    `
                    container.appendChild(card)
                })
            } catch (error) {
                console.error('Error cargando galerías:', error)
            }
        }
        
        function filterByCategory(category) {
            currentCategory = category
            
            // Update button styles
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active')
            })
            event.target.classList.add('active')
            
            // Load galerías
            loadGalerias(category)
        }
        
        // Load initial data
        loadGalerias()
    </script>
</body>
</html>
```

---

## Notas de Implementación

1. **Cacheo:** Los datos se cachean en la aplicación por la estrategia de revalidatePath de Next.js.
2. **CORS:** El endpoint es público y accesible desde cualquier origen.
3. **Rate Limiting:** Sin limitación de tasa. Implementar en cliente si es necesario.
4. **Autenticación:** No requerida. Solo devuelve galerías marcadas como `activo=true`.

---

## Soporte

Para reportar issues o sugerencias sobre la API, contactar al equipo de desarrollo.

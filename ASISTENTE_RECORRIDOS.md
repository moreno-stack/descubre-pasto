# 🤖 Asistente Conversacional de Recorridos

## ✨ Nueva Funcionalidad

La sección de **"Recorrido"** ahora es un **asistente conversacional** que te guía paso a paso para crear tu itinerario perfecto.

## 🎯 Características

### Conversación Inteligente
- **Paso a paso**: El asistente pregunta uno por uno:
  1. ⏰ Tiempo disponible
  2. 💰 Presupuesto
  3. 🎯 Intereses
  4. ✨ Preferencias especiales

### Interacción Natural
- **Chat fluido**: Conversación como con un humano
- **Sugerencias rápidas**: Botones para respuestas comunes
- **Respuestas flexibles**: Entiende diferentes formas de responder
- **Historial visible**: Ve toda la conversación

### Generación Automática
- **Recomendación personalizada**: Basada en tus respuestas
- **Ruta optimizada**: Considera tiempo y distancias
- **Explicaciones claras**: Cada lugar con su razón de inclusión
- **Opción de reiniciar**: Crear nuevo recorrido fácilmente

## 🎨 Diseño

### Visual
- **Interfaz de chat moderna**: Similar a apps de mensajería
- **Avatar del asistente**: Icono de bot para identificarlo
- **Colores diferenciados**: Usuario (azul) vs Asistente (morado)
- **Animaciones suaves**: Mensajes aparecen naturalmente

### UX
- **Responsive**: Se adapta a cualquier dispositivo
- **Pantalla completa en móvil**: Mejor experiencia en celulares
- **Auto-scroll**: Siempre ves el último mensaje
- **Focus automático**: Input listo para escribir

## 💬 Flujo de Conversación

### 1. Bienvenida
```
Asistente: ¡Hola! Soy tu asistente de viaje en Pasto. 🏔️

Voy a ayudarte a crear un recorrido perfecto. Dime, 
¿cuánto tiempo tienes disponible para tu visita?
```

**Opciones rápidas**: `2 horas` | `3 horas` | `4 horas` | `Todo el día`

### 2. Tiempo Disponible
```
Usuario: 3 horas

Asistente: Perfecto, 3 horas es un buen tiempo. 💰

¿Qué presupuesto tienes en mente?

• Bajo - Opciones económicas
• Medio - Balance calidad-precio
• Alto - Experiencias premium
```

**Opciones rápidas**: `Bajo` | `Medio` | `Alto`

### 3. Presupuesto
```
Usuario: Medio

Asistente: Entendido, presupuesto medio. 🎯

¿Qué tipo de experiencias te interesan?

• Cultura - Arte, fiestas y saberes
• Historia - Memoria de la ciudad
• Gastronomía - Sabores de Nariño
• Naturaleza - Paisajes cercanos
```

**Opciones rápidas**: `Cultura` | `Historia` | `Gastronomía` | `Naturaleza` | `Cultura e Historia` | `Todo`

### 4. Intereses
```
Usuario: Cultura y gastronomía

Asistente: Excelente elección: Cultura, Gastronomía. ✨

¿Hay algo específico que quieras incluir o evitar en tu recorrido?

(Por ejemplo: "quiero probar comida típica" o simplemente 
escribe "no" para continuar)
```

**Opciones rápidas**: `Quiero probar comida típica` | `Lugares fotogénicos` | `Con niños` | `No`

### 5. Preferencias Especiales
```
Usuario: Lugares fotogénicos

Asistente: Perfecto! Déjame crear tu recorrido personalizado... 🗺️
```

### 6. Resultado
```
Asistente: ¡Listo! He creado tu recorrido personalizado: 🎉

📍 4 lugares · ⏱️ 165 minutos aprox.

1. Plaza de Nariño
Parque - 30 min
Incluido por tu interés en cultura y su compatibilidad 
con el tiempo indicado.

2. Museo del Oro del Banco de la República
Museo - 45 min
Incluido por tu interés en cultura y su compatibilidad 
con el tiempo indicado.

[... más lugares ...]

💡 Los horarios y tiempos son referenciales. Ruta optimizada con IA.
```

### 7. Opción de Reinicio
```
Asistente: ¿Quieres crear otro recorrido diferente? 
Escribe 'sí' o 'nuevo' para empezar de nuevo.
```

## 🛠️ Uso del Asistente

### Acceso
1. Click en **"Recorrido"** en la navegación
2. O click en **"Crear mi recorrido"** en la portada

### Responder al Asistente

#### Opción 1: Sugerencias Rápidas
- Click en los botones predefinidos
- Respuesta automática en el input
- Presiona Enter o click en enviar

#### Opción 2: Escribir Libremente
- Escribe tu respuesta en el input
- El asistente entiende:
  - "3 horas" o "tres horas"
  - "bajo" o "económico" o "barato"
  - "cultura" o "cultural" o "cultura e historia"
  - "no" o "nada" o "continuar"

### Crear Nuevo Recorrido
- Al final, escribe: `sí`, `nuevo`, `otra`, `otra vez`
- O click en el botón ↻ de reiniciar

## 📱 Responsive

### Desktop (> 1024px)
- Chat centrado con max-width
- Altura ajustada (75vh)
- Sugerencias en fila horizontal

### Tablet (768px - 1024px)
- Chat adaptado al ancho
- Altura optimizada
- Sugerencias envuelven

### Mobile (< 768px)
- Chat ocupa altura completa
- Input más grande para fácil escritura
- Sugerencias más pequeñas
- Botón enviar más accesible

## 🎨 Personalización

### Colores del Asistente
```css
.route-assistant-header {
  background: var(--gradient-main); /* Morado por defecto */
}

.assistant-message .route-message-avatar {
  background: var(--gradient-main); /* Avatar del bot */
}
```

### Mensajes del Usuario
```css
.user-message .route-message-content {
  background: var(--gradient-cool); /* Azul por defecto */
}
```

## 🔧 Arquitectura Técnica

### Componente
**Archivo**: `components/RouteAssistant.tsx`

**Props**:
- `favorites: string[]` - IDs de lugares favoritos
- `onRecommendationGenerated?: (rec) => void` - Callback cuando se genera ruta

**Estados**:
- `messages` - Historial de conversación
- `input` - Texto del input actual
- `loading` - Generando recomendación
- `currentStep` - Paso actual del flujo
- `routeData` - Datos recopilados

### Flujo de Datos
```
Usuario escribe → handleSubmit → processUserInput 
→ Detecta paso actual → Actualiza routeData 
→ Genera siguiente pregunta → Actualiza messages
```

### Generación de Ruta
```
routeData completo → generateRecommendation 
→ API /api/recommend → Recibe recomendación 
→ Formatea mensaje → Muestra resultado
```

## ✅ Ventajas vs Formulario Anterior

| Aspecto | Formulario Anterior | Asistente Nuevo |
|---------|---------------------|-----------------|
| **Interacción** | Todos los campos a la vez | Paso a paso guiado |
| **Usabilidad** | Abrumador para nuevos usuarios | Intuitivo y claro |
| **Engagement** | Estático | Conversacional |
| **Móvil** | Campos pequeños | Optimizado para touch |
| **Flexibilidad** | Opciones fijas | Entiende texto libre |
| **Feedback** | Solo al final | Confirmación en cada paso |
| **Personalización** | Limitada | Pregunta adicional de preferencias |

## 🎯 Casos de Uso

### Usuario Principiante
```
"No sé qué hacer en Pasto"
→ Asistente guía paso a paso
→ Sugerencias claras
→ Recibe ruta personalizada
```

### Usuario Con Prisa
```
→ Click en sugerencias rápidas
→ Responde en segundos
→ Recibe ruta inmediata
```

### Usuario Específico
```
"Quiero ver templos históricos"
→ Escribe en preferencias
→ Asistente adapta la ruta
→ Lugares relevantes incluidos
```

### Usuario Indeciso
```
→ Crea una ruta
→ No le convence
→ "nuevo recorrido"
→ Prueba otra combinación
```

## 🚀 Mejoras Futuras

### Corto Plazo
- [ ] Guardar conversaciones
- [ ] Compartir rutas por link
- [ ] Sugerir hora de inicio
- [ ] Mostrar mapa de la ruta

### Mediano Plazo
- [ ] Voz a texto (input por voz)
- [ ] Notificaciones de ruta
- [ ] Integración con calendario
- [ ] Clima del día

### Largo Plazo
- [ ] IA más conversacional (contexto completo)
- [ ] Aprender de preferencias del usuario
- [ ] Recomendar según hora del día
- [ ] Rutas colaborativas (varios usuarios)

## 📊 Métricas de Éxito

### Engagement
- **Tiempo en sección**: > 2 minutos
- **Mensajes por sesión**: > 5
- **Rutas completadas**: > 70%

### Satisfacción
- **Uso de sugerencias rápidas**: > 60%
- **Reintentos (nuevo recorrido)**: 20-30%
- **Conversaciones abandonadas**: < 20%

## 🔍 Testing

### Casos de Prueba
1. **Flujo completo con sugerencias**
2. **Flujo completo escribiendo**
3. **Respuestas mixtas (botones + texto)**
4. **Reiniciar conversación**
5. **Respuestas inválidas (manejo de errores)**

### Escenarios Especiales
- Usuario escribe números sin "horas"
- Usuario combina múltiples intereses
- Usuario escribe "todo" en intereses
- Usuario dice "no tengo preferencias"

## 📚 Documentación Relacionada

- **`components/RouteAssistant.tsx`** - Código del componente
- **`app/globals.css`** - Estilos del asistente
- **`app/api/recommend/route.ts`** - API de recomendaciones
- **`ACTUALIZACION_V2.md`** - Historial de cambios

---

**Versión**: 3.0.0  
**Fecha**: Octubre 4, 2026  
**Estado**: ✅ Completado  
**Tipo**: Asistente Conversacional  

¡Disfruta de la nueva experiencia conversacional! 🎉

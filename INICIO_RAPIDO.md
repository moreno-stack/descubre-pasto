# 🚀 Inicio Rápido - Descubre Pasto IA

## ✅ Todo está configurado

Las siguientes características ya están implementadas y funcionando:

### 🤖 Asistente de IA con Groq
- ✅ API integrada
- ✅ Llama 3.3 70B configurado
- ✅ API Key ya configurada
- ✅ Fallback automático si falla

### 🎥 Video en la Portada
- ✅ Código implementado
- ✅ Carpeta `public/videos/` creada
- ✅ Fallback a video de ejemplo

## 🎯 Próximos Pasos

### 1. Prueba la Aplicación

```bash
npm run dev
```

Abre: http://localhost:3000

### 2. Prueba el Asistente de IA

1. Haz clic en "Recorrido" o "Crear mi recorrido"
2. Prueba estas consultas:
   - "Cultura e historia, 3 horas"
   - "Comida típica con poco presupuesto"
   - "Lugares naturales para una tarde"

### 3. Agrega Tu Video (Opcional)

Si quieres tu propio video en la portada:

1. **Consigue un video** de Pasto (paisajes, cultura, carnaval, etc.)
2. **Nómbralo**: `pasto-discover.mp4`
3. **Colócalo en**: `public/videos/pasto-discover.mp4`
4. **Especificaciones**:
   - Formato: MP4
   - Resolución: 1280x720 o mayor
   - Tamaño: Máximo 10MB
   - Duración: 10-30 segundos

**Instrucciones completas**: Ver `INSTRUCCIONES_VIDEO.md`

## 📱 Funcionalidades Disponibles

### Sin Video Propio
- ✅ Video de ejemplo se carga automáticamente
- ✅ Todo funciona perfectamente
- ✅ No hay errores

### Con Tu Video
- ✅ Video personalizado de Pasto
- ✅ Mejor branding
- ✅ Mayor impacto visual

## 🔑 Tu API Key de Groq

Configura tu API key en `.env.local`:
```
GROQ_API_KEY=tu_api_key_de_groq_aqui
```

### ⚠️ Importante:
- Esta key es privada
- No la compartas públicamente
- Está protegida en `.gitignore`
- Puedes obtenerla en: https://console.groq.com/keys

### Para Producción (Vercel):
1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega: `GROQ_API_KEY` con tu clave de Groq

## 🧪 Probar las Funcionalidades

### 1. Asistente de IA

**Consulta simple**:
```
"Quiero ver cultura, tengo 2 horas"
```

**Consulta con presupuesto**:
```
"Lugares baratos de naturaleza para la tarde"
```

**Consulta completa**:
```
"Museo y comida típica, tengo 4 horas y presupuesto medio"
```

### 2. Video de Portada

1. Ve a la página principal
2. Verás el video con el texto: "Pasto se descubre paso a paso"
3. El video se reproduce automáticamente en loop

## 📊 Verificar que Todo Funciona

### Checklist:

- [ ] `npm run dev` inicia sin errores
- [ ] Página principal carga correctamente
- [ ] Video se reproduce en la portada
- [ ] Puedes navegar por las secciones
- [ ] El asistente genera recomendaciones
- [ ] Las recomendaciones muestran rutas inteligentes

## 🎉 ¡Listo para Usar!

Tu aplicación ahora tiene:
- 🤖 Inteligencia artificial avanzada
- 🎥 Video dinámico en la portada
- 🗺️ Recomendaciones personalizadas
- 📱 Diseño responsive
- ⚡ Rendimiento optimizado

## 📚 Documentación Completa

- **`README.md`** - Información general del proyecto
- **`CAMBIOS_REALIZADOS.md`** - Lista detallada de cambios
- **`INSTRUCCIONES_VIDEO.md`** - Guía completa para videos
- **Este archivo** - Inicio rápido

## 🆘 ¿Problemas?

### La IA no responde:
- Verifica que `.env.local` existe
- Revisa la consola del servidor (terminal)
- El fallback se activa automáticamente

### El video no aparece:
- Normal si no tienes `pasto-discover.mp4`
- Se usa video de ejemplo automáticamente
- Sigue `INSTRUCCIONES_VIDEO.md` para agregar el tuyo

### Errores al compilar:
```bash
npm install
npm run typecheck
npm run build
```

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Verificar TypeScript
npm run typecheck

# Compilar
npm run build

# Producción local
npm start
```

---

**¡Disfruta tu nueva aplicación con IA! 🎉**

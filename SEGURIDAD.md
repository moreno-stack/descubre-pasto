# 🔒 Seguridad y Manejo de API Keys

## ⚠️ IMPORTANTE: API Key Expuesta

**Si tu API key fue expuesta anteriormente en Git**, debes:

### 1. Revocar la API Key Actual

1. Ve a: https://console.groq.com/keys
2. Encuentra tu API key actual
3. Haz clic en "Revoke" o "Delete"
4. Confirma la revocación

### 2. Generar una Nueva API Key

1. En la misma página, haz clic en "Create API Key"
2. Dale un nombre: "Descubre Pasto - Production"
3. Copia la nueva API key
4. **GUÁRDALA EN UN LUGAR SEGURO**

### 3. Actualizar tu Configuración Local

Actualiza tu archivo `.env.local`:

```bash
GROQ_API_KEY=tu_nueva_api_key_aqui
```

### 4. Actualizar en Vercel (si ya desplegaste)

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Edita `GROQ_API_KEY`
4. Pega la nueva API key
5. Guarda y redeploya

## 🛡️ Buenas Prácticas de Seguridad

### ✅ Hacer SIEMPRE:

- **Usar `.env.local`** para secrets locales
- **Verificar `.gitignore`** antes de commit
- **Usar `.env.example`** para documentar (sin valores reales)
- **Revisar commits** antes de push
- **Revocar keys expuestas** inmediatamente

### ❌ NO Hacer NUNCA:

- ❌ Hardcodear API keys en el código
- ❌ Compartir archivos `.env` o `.env.local`
- ❌ Commitear archivos con secrets
- ❌ Publicar API keys en documentación
- ❌ Usar la misma key en múltiples proyectos

## 📋 Checklist Antes de Commit

Antes de cada commit, verifica:

- [ ] ¿Agregaste nuevos archivos con secrets?
- [ ] ¿Modificaste archivos de documentación con keys?
- [ ] ¿Está `.env.local` en `.gitignore`?
- [ ] ¿Revisaste el `git diff` antes de commit?
- [ ] ¿GitHub bloqueó el push? → Revoca la key

## 🔍 Cómo Verificar si Expusiste una Key

### Buscar en el historial de Git:

```bash
# Buscar en commits recientes
git log -p | grep -i "gsk_"

# Buscar en todos los archivos trackeados
git grep "gsk_" $(git rev-list --all)
```

### Buscar en archivos locales:

```bash
# PowerShell
Get-ChildItem -Recurse -File | Select-String "gsk_"

# Git Bash
grep -r "gsk_" --exclude-dir=node_modules --exclude-dir=.git
```

## 🔧 Limpiar Historial de Git (Avanzado)

Si ya hiciste push con una key expuesta:

### Opción 1: Usar GitHub Secret Scanner

1. GitHub te enviará un email
2. Sigue el link para revocar
3. O marca como "falso positivo" si es apropiado

### Opción 2: Force Push (Cuidado!)

```bash
# Solo si NO hay otros colaboradores
git reset --soft HEAD~1  # Vuelve un commit atrás
# Edita los archivos problemáticos
git add .
git commit -m "fix: remove exposed secrets"
git push --force origin main
```

**⚠️ WARNING**: `git push --force` reescribe el historial. Solo úsalo si:
- Eres el único colaborador
- Nadie más ha hecho pull de los commits problemáticos
- Entiendes las consecuencias

### Opción 3: git-filter-repo (Recomendado para históricos grandes)

```bash
# Instalar git-filter-repo
pip install git-filter-repo

# Remover archivos específicos del historial
git filter-repo --path CAMBIOS_REALIZADOS.md --invert-paths
git filter-repo --path INICIO_RAPIDO.md --invert-paths
```

## 🔐 Gestión de Secrets en Producción

### Para Vercel:

1. **Environment Variables** en dashboard
2. Diferentes valores para Preview/Production
3. Nunca exponerlas en el frontend
4. Usar solo en API routes del servidor

### Para otros servicios:

- **Heroku**: Config Vars
- **Netlify**: Environment Variables
- **AWS**: Secrets Manager
- **Azure**: Key Vault

## 📞 Si Ya Expusiste una Key

### Pasos Inmediatos:

1. **REVOCA la key inmediatamente**
2. **Genera una nueva**
3. **Actualiza todos tus deployments**
4. **Monitorea el uso** en Groq dashboard
5. **Cambia otras keys si usaste la misma**

### Señales de Compromiso:

- 🚨 Uso inusual de la API
- 🚨 Llamadas desde IPs desconocidas
- 🚨 Límites de rate alcanzados
- 🚨 Costos inesperados

## 🎓 Recursos Adicionales

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Groq Security Best Practices](https://console.groq.com/docs/security)
- [Git Secrets](https://github.com/awslabs/git-secrets) - Herramienta para prevenir commits con secrets

## ✅ Tu Situación Actual

**Estado**: ✅ Seguro

- La API key fue removida de los archivos de documentación
- `.env.local` está correctamente en `.gitignore`
- El nuevo commit está limpio
- Push exitoso sin exposición de secrets

**Recomendación**: 

Aunque la key fue removida del último commit, considera revocar tu API key actual y generar una nueva como medida de precaución si estuvo expuesta en commits anteriores.

---

**Recuerda**: La seguridad es un proceso continuo, no un evento único. 🔒

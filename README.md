# Greentech Migration Tool

**Plugin WordPress gratuito para planificación y mapeo de URLs en migraciones web.**

Desarrollado por **[Yel Martínez](https://yel-martinez-portfolio.com)** — Greentech.

---

## Descripción

Herramienta interactiva en formato wizard (5 pasos) que guía el proceso completo de una migración web:

1. **Configuración** — CMS, tipo de servidor, volumen de URLs, tipo de cambio
2. **Checklist previa** — ítems contextualizados según tu entorno (Crítico / Recomendado)
3. **Mapeo de URLs** — entrada manual, transformación por patrón, regex, o importación CSV
4. **Generación de redirecciones** — código listo para Apache (.htaccess), Nginx, Cloudflare y IIS
5. **Exportar** — archivo de servidor, CSV del mapeo, checklist .txt, informe HTML completo

---

## Versiones

| Versión | URLs máximas | Distribución |
|---------|-------------|--------------|
| **Pública** (plugin WordPress) | 50 URLs | [yel-martinez-portfolio.com](https://yel-martinez-portfolio.com/mapeo-automatizado-de-urls-para-migraciones-web/) |
| **Completa** (este repositorio) | Sin límite | GitHub (uso libre, GPL-2.0) |

---

## Instalación (WordPress)

1. Descarga el zip del repositorio
2. En WordPress: **Plugins → Añadir nuevo → Subir plugin**
3. Activa el plugin
4. Añade el shortcode `[greentech_migration]` en cualquier página o entrada

---

## Instalación (versión standalone / local)

Abre `standalone/index.html` directamente en el navegador. No requiere servidor.

---

## Compatibilidad

- **WordPress:** 5.8+
- **PHP:** 7.4+
- **Navegadores:** Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- **Tema:** Diseñado para funcionar con el design system de Greentech (variables CSS `--ds-*`). En otros temas, los estilos tienen fallbacks hardcoded.

---

## Servidores soportados

| Servidor | Formato generado |
|----------|-----------------|
| Apache | `.htaccess` (mod_rewrite) |
| LiteSpeed | `.htaccess` (compatible Apache) |
| Nginx | Bloque `server {}` para nginx.conf |
| Cloudflare | JSON para Redirect Rules |
| IIS (Windows) | `web.config` (módulo URL Rewrite) |

---

## Estructura del plugin

```
greentech-migration-tool/
├── greentech-migration-tool.php   # Plugin principal, shortcode, registro de assets
├── assets/
│   ├── gtmt-style.css             # Estilos (prefijos .mw- y .gtmt-)
│   └── gtmt-script.js             # Lógica JS (namespace gtmt)
├── templates/
│   └── tool.php                   # HTML del wizard
└── README.md
```

---

## Buenas prácticas incluidas en la herramienta

- Checklist contextualizada según CMS, servidor y tipo de cambio
- Guía de dónde colocar físicamente el archivo en cada servidor
- Generador de redirecciones con comentarios de autoría
- Advertencias sobre .htaccess vs Nginx vs Cloudflare
- Errores frecuentes con diagnóstico y solución
- Checklist de verificación post-migración

---

## Autor y licencia

**Yel Martínez** — Tecnóloga y estratega digital  
Web: [yel-martinez-portfolio.com](https://yel-martinez-portfolio.com)  
Herramienta: [Mapeo de URLs para migraciones web](https://yel-martinez-portfolio.com/mapeo-automatizado-de-urls-para-migraciones-web/)

Licencia: **GPL-2.0-or-later** — libre para usar, modificar y distribuir manteniendo la atribución.

---

## Changelog

### 1.0.0 (2025)
- Versión inicial
- Wizard de 5 fases
- Soporte Apache, Nginx, Cloudflare, IIS, LiteSpeed
- Checklist contextualizada (pre y post migración)
- Exportación: .htaccess / nginx.conf / web.config / CF JSON / CSV / informe HTML
- Límite de 50 URLs en versión pública embebida en WordPress

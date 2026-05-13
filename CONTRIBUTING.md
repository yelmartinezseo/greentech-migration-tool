# Cómo contribuir a Greentech Migration Tool

Gracias por tu interés en mejorar esta herramienta. Cualquier contribución es bienvenida, desde correcciones de errores hasta nuevas funcionalidades.

---

## Tipos de contribución aceptadas

- **Bugs** — Si encuentras un error, abre un Issue describiendo el problema, el navegador/entorno y los pasos para reproducirlo.
- **Mejoras de compatibilidad** — Nuevos servidores, CMS o formatos de exportación.
- **Traducciones** — La herramienta está en español. Contribuciones en inglés, catalán o portugués son bienvenidas.
- **Documentación** — Correcciones o ampliaciones del README y comentarios en el código.

---

## Proceso para contribuir con código

1. Haz un fork del repositorio
2. Crea una rama descriptiva: `git checkout -b mejora/soporte-caddy`
3. Realiza tus cambios manteniendo los prefijos CSS `.mw-` y `.gtmt-` y el namespace JS `gtmt`
4. Abre un Pull Request con descripción clara de qué cambia y por qué

---

## Estilo de código

- **PHP:** compatible con WordPress Coding Standards
- **JS:** ES6+, sin dependencias externas, namespace `gtmt`
- **CSS:** variables `--ds-*` con fallbacks hardcoded para temas externos

---

## Autor principal

**Yel Martínez** — [yel-martinez-portfolio.com](https://yel-martinez-portfolio.com)  
Consultas técnicas: a través de Issues en este repositorio.
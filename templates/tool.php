<?php
/**
 * Template principal de la herramienta de migración.
 * Incluido por el shortcode [greentech_migration].
 *
 * @package GreentechMigrationTool
 * @author  Yel Martínez <https://yel-martinez-portfolio.com>
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }
?>

<!-- GREENTECH MIGRATION TOOL v<?php echo esc_html( GTMT_VERSION ); ?> -->
<!-- Autor: Yel Martínez — https://yel-martinez-portfolio.com -->
<!-- Licencia: GPL-2.0-or-later -->

<div class="ds-section-navy gtmt-wrapper" style="padding:32px 0 60px;position:relative;" id="gtmt-app">
<div class="ds-container" style="max-width:840px">

  <!-- ===== INTRO SEO ===== -->
  <div class="case-problem-box case-problem-box--info" style="margin-bottom:28px">
    <p class="case-problem-title case-problem-title--info">Herramienta gratuita de mapeo de URLs para migraciones web</p>
    <p class="case-problem-text" style="margin-bottom:10px">
      Planifica y ejecuta tu migración web sin perder tráfico orgánico. Esta herramienta te guía paso a paso:
      desde la configuración del entorno (CMS y servidor) hasta la generación del código de redirecciones 301
      listo para pegar en Apache, Nginx, Cloudflare o IIS — con checklist pre y post migración incluida.
    </p>
    <p class="case-problem-text" style="margin:0;font-size:0.8rem;color:rgba(255,255,255,0.5)">
      Versión pública: hasta <?php echo esc_html( GTMT_URL_LIMIT ); ?> URLs.
      Para proyectos de mayor volumen,
      <a href="<?php echo esc_url( GTMT_GITHUB_URL ); ?>" target="_blank" rel="noopener" style="color:var(--ds-accent)">descarga la versión completa desde GitHub</a>.
    </p>
  </div>

  <!-- ===== BANNER LÍMITE (oculto hasta alcanzarlo) ===== -->
  <div class="gtmt-limit-banner" id="gtmt-limit-banner" role="alert">
    <p class="gtmt-limit-title">Has alcanzado el límite de <?php echo esc_html( GTMT_URL_LIMIT ); ?> URLs de la versión pública</p>
    <p class="gtmt-limit-text">
      Esta versión está optimizada para migraciones pequeñas y medianas.
      Para proyectos con mayor volumen de URLs, descarga la <strong>versión completa sin límites</strong>
      disponible en GitHub — es gratuita, open source y la puedes usar en local o en tu propio servidor.
    </p>
    <div class="gtmt-limit-actions">
      <a href="<?php echo esc_url( GTMT_GITHUB_URL ); ?>" target="_blank" rel="noopener" class="case-figma-btn">
        Descargar versión completa en GitHub
      </a>
      <a href="<?php echo esc_url( GTMT_CONTACT_URL ); ?>" target="_blank" rel="noopener" class="case-figma-btn case-figma-btn--outline">
        Contactar con Yel Martínez
      </a>
    </div>
  </div>

  <!-- ===== PROGRESS BAR ===== -->
  <div class="mw-progress" id="progressBar" role="navigation" aria-label="Pasos del wizard">
    <div class="mw-progress-step active" id="ps-1">
      <div class="mw-progress-dot" aria-label="Paso 1">1</div>
      <div class="mw-progress-label">Configuración</div>
    </div>
    <div class="mw-progress-line" id="pl-1"></div>
    <div class="mw-progress-step" id="ps-2">
      <div class="mw-progress-dot" aria-label="Paso 2">2</div>
      <div class="mw-progress-label">Checklist previa</div>
    </div>
    <div class="mw-progress-line" id="pl-2"></div>
    <div class="mw-progress-step" id="ps-3">
      <div class="mw-progress-dot" aria-label="Paso 3">3</div>
      <div class="mw-progress-label">Mapeo URLs</div>
    </div>
    <div class="mw-progress-line" id="pl-3"></div>
    <div class="mw-progress-step" id="ps-4">
      <div class="mw-progress-dot" aria-label="Paso 4">4</div>
      <div class="mw-progress-label">Redirecciones</div>
    </div>
    <div class="mw-progress-line" id="pl-4"></div>
    <div class="mw-progress-step" id="ps-5">
      <div class="mw-progress-dot" aria-label="Paso 5">5</div>
      <div class="mw-progress-label">Exportar</div>
    </div>
  </div>

  <!-- ===== FASE 1: CONFIGURACIÓN ===== -->
  <div class="mw-phase active" id="phase-1">
    <div class="ds-component-card" style="margin-bottom:16px">
      <div class="ds-component-header ds-component-header-accent">
        <div class="ds-component-number">1</div>
        <div>
          <p class="ds-component-title">Configura tu migración</p>
          <p style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin:0">La herramienta adaptará el código y las recomendaciones a tu entorno específico.</p>
        </div>
      </div>
      <div class="ds-component-body" style="background:var(--ds-navy)">

        <div style="margin-bottom:18px">
          <p class="ds-decision-label" style="margin-bottom:8px">CMS de origen <span style="color:var(--ds-accent)">*</span></p>
          <div class="mw-opt-grid" id="cms-grid">
            <div class="mw-opt selected" data-val="wordpress"  onclick="gtmt.selectOpt(this,'cms')"><span>🟦</span>WordPress</div>
            <div class="mw-opt"          data-val="prestashop" onclick="gtmt.selectOpt(this,'cms')"><span>🛒</span>PrestaShop</div>
            <div class="mw-opt"          data-val="joomla"     onclick="gtmt.selectOpt(this,'cms')"><span>🟠</span>Joomla</div>
            <div class="mw-opt"          data-val="drupal"     onclick="gtmt.selectOpt(this,'cms')"><span>💧</span>Drupal</div>
            <div class="mw-opt"          data-val="shopify"    onclick="gtmt.selectOpt(this,'cms')"><span>🛍️</span>Shopify</div>
            <div class="mw-opt"          data-val="custom"     onclick="gtmt.selectOpt(this,'cms')"><span>⚙️</span>Custom/Otro</div>
          </div>
        </div>

        <div style="margin-bottom:18px">
          <p class="ds-decision-label" style="margin-bottom:8px">Servidor web <span style="color:var(--ds-accent)">*</span></p>
          <div class="mw-opt-grid" id="server-grid">
            <div class="mw-opt selected" data-val="apache"     onclick="gtmt.selectOpt(this,'server')"><span>🔴</span>Apache</div>
            <div class="mw-opt"          data-val="nginx"      onclick="gtmt.selectOpt(this,'server')"><span>🟢</span>Nginx</div>
            <div class="mw-opt"          data-val="cloudflare" onclick="gtmt.selectOpt(this,'server')"><span>🌐</span>Cloudflare</div>
            <div class="mw-opt"          data-val="iis"        onclick="gtmt.selectOpt(this,'server')"><span>🪟</span>IIS (Windows)</div>
            <div class="mw-opt"          data-val="litespeed"  onclick="gtmt.selectOpt(this,'server')"><span>⚡</span>LiteSpeed</div>
            <div class="mw-opt"          data-val="noknow"     onclick="gtmt.selectOpt(this,'server')"><span>❓</span>No lo sé</div>
          </div>
        </div>

        <div style="margin-bottom:18px">
          <p class="ds-decision-label" style="margin-bottom:8px">Volumen estimado de URLs</p>
          <div class="mw-opt-grid mw-opt-grid-sm" id="volume-grid">
            <div class="mw-opt selected" data-val="small"  onclick="gtmt.selectOpt(this,'volume')">Hasta 50</div>
            <div class="mw-opt"          data-val="medium" onclick="gtmt.selectOpt(this,'volume')">50–500</div>
            <div class="mw-opt"          data-val="large"  onclick="gtmt.selectOpt(this,'volume')">500–5.000</div>
            <div class="mw-opt"          data-val="xlarge" onclick="gtmt.selectOpt(this,'volume')">+5.000</div>
          </div>
        </div>

        <div style="margin-bottom:18px">
          <p class="ds-decision-label" style="margin-bottom:8px">Tipo de cambio en las URLs</p>
          <div class="mw-opt-grid" id="change-grid">
            <div class="mw-opt selected" data-val="slug"      onclick="gtmt.selectOpt(this,'change')"><span>✏️</span>Cambio de slug</div>
            <div class="mw-opt"          data-val="domain"    onclick="gtmt.selectOpt(this,'change')"><span>🌍</span>Cambio de dominio</div>
            <div class="mw-opt"          data-val="protocol"  onclick="gtmt.selectOpt(this,'change')"><span>🔒</span>HTTP → HTTPS</div>
            <div class="mw-opt"          data-val="structure" onclick="gtmt.selectOpt(this,'change')"><span>🏗️</span>Nueva estructura</div>
            <div class="mw-opt"          data-val="lang"      onclick="gtmt.selectOpt(this,'change')"><span>🌐</span>Multiidioma</div>
            <div class="mw-opt"          data-val="mixed"     onclick="gtmt.selectOpt(this,'change')"><span>🔀</span>Combinado</div>
          </div>
        </div>

        <div style="margin-bottom:18px">
          <p class="ds-decision-label" style="margin-bottom:8px">¿Hay cambio de dominio?</p>
          <div class="mw-opt-grid mw-opt-grid-sm" id="domainchange-grid">
            <div class="mw-opt selected" data-val="no"  onclick="gtmt.selectOpt(this,'domainchange')">No</div>
            <div class="mw-opt"          data-val="yes" onclick="gtmt.selectOpt(this,'domainchange')">Sí</div>
          </div>
        </div>

        <div id="domain-fields" style="display:none;margin-bottom:18px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <p class="ds-decision-label" style="margin-bottom:6px">Dominio origen</p>
              <input class="mw-input" type="url" placeholder="https://dominio-antiguo.com" oninput="gtmt.config.domainOrigin=this.value" aria-label="Dominio origen">
            </div>
            <div>
              <p class="ds-decision-label" style="margin-bottom:6px">Dominio destino</p>
              <input class="mw-input" type="url" placeholder="https://dominio-nuevo.com" oninput="gtmt.config.domainDest=this.value" aria-label="Dominio destino">
            </div>
          </div>
        </div>

        <div class="case-problem-box case-problem-box--info" id="server-note" style="margin-bottom:0;margin-top:8px">
          <p class="case-problem-title case-problem-title--info" style="font-size:0.85rem;margin-bottom:6px">Nota sobre tu servidor</p>
          <p class="case-problem-text" id="server-note-text" style="margin:0;font-size:0.82rem"></p>
        </div>

      </div><!-- /ds-component-body -->
    </div><!-- /ds-component-card -->

    <div class="mw-actions">
      <button class="case-figma-btn" onclick="gtmt.goToPhase(2)">Continuar → Checklist previa</button>
    </div>
  </div><!-- /phase-1 -->

  <!-- ===== FASE 2: CHECKLIST PREVIA ===== -->
  <div class="mw-phase" id="phase-2">
    <div class="ds-component-card" style="margin-bottom:16px">
      <div class="ds-component-header ds-component-header-accent">
        <div class="ds-component-number">2</div>
        <div>
          <p class="ds-component-title">Checklist de preparación previa</p>
          <p style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin:0">
            Los ítems <span style="color:#f87171;font-weight:700">CRÍTICO</span> pueden causar pérdidas irreversibles de tráfico si se omiten.
          </p>
        </div>
      </div>
      <div class="ds-component-body" style="background:var(--ds-navy)">
        <div class="mw-stats-row" role="status" aria-live="polite">
          <div class="mw-stat-mini"><div class="mw-stat-val" id="stat-done">0</div><div class="mw-stat-lbl">Completados</div></div>
          <div class="mw-stat-mini"><div class="mw-stat-val" id="stat-total">0</div><div class="mw-stat-lbl">Total</div></div>
          <div class="mw-stat-mini"><div class="mw-stat-val" id="stat-pct">0%</div><div class="mw-stat-lbl">Progreso</div></div>
        </div>
        <div id="checklist-container" role="list"></div>
      </div>
    </div>
    <div class="mw-actions">
      <button class="case-figma-btn case-figma-btn--outline" onclick="gtmt.goToPhase(1)">← Volver</button>
      <button class="case-figma-btn" onclick="gtmt.goToPhase(3)">Continuar → Mapeo de URLs</button>
    </div>
  </div><!-- /phase-2 -->

  <!-- ===== FASE 3: MAPEO DE URLs ===== -->
  <div class="mw-phase" id="phase-3">
    <div class="ds-component-card" style="margin-bottom:16px">
      <div class="ds-component-header ds-component-header-accent">
        <div class="ds-component-number">3</div>
        <div>
          <p class="ds-component-title">Mapeo de URLs</p>
          <p style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin:0">
            Versión pública: hasta <strong style="color:var(--ds-accent)"><?php echo esc_html( GTMT_URL_LIMIT ); ?> URLs</strong>.
            Para proyectos mayores, <a href="<?php echo esc_url( GTMT_GITHUB_URL ); ?>" target="_blank" rel="noopener" style="color:var(--ds-accent)">descarga la versión completa</a>.
          </p>
        </div>
      </div>
      <div class="ds-component-body" style="background:var(--ds-navy)">

        <div class="mw-tabs" role="tablist">
          <div class="mw-tab active" role="tab" aria-selected="true"  onclick="gtmt.switchTab('manual',this)">Manual</div>
          <div class="mw-tab"        role="tab" aria-selected="false" onclick="gtmt.switchTab('pattern',this)">Por patrón</div>
          <div class="mw-tab"        role="tab" aria-selected="false" onclick="gtmt.switchTab('regex',this)">Regex</div>
          <div class="mw-tab"        role="tab" aria-selected="false" onclick="gtmt.switchTab('paste',this)">Pegar CSV</div>
        </div>

        <!-- TAB MANUAL -->
        <div id="tab-manual" role="tabpanel">
          <div class="case-problem-box case-problem-box--info" style="margin-bottom:12px">
            <p class="case-problem-text" style="margin:0;font-size:0.82rem">Introduce las URLs completas con protocolo: <code>https://ejemplo.com/pagina-antigua/</code></p>
          </div>
          <div style="display:grid;grid-template-columns:1fr 26px 1fr 30px;gap:8px;margin-bottom:6px">
            <span class="ds-decision-label" style="margin:0;font-size:0.66rem">URL Origen (antigua)</span>
            <span></span>
            <span class="ds-decision-label" style="margin:0;font-size:0.66rem">URL Destino (nueva)</span>
            <span></span>
          </div>
          <div id="url-rows" role="list"></div>
          <div class="gtmt-limit-counter" id="url-counter"><span id="url-count">0</span> / <?php echo esc_html( GTMT_URL_LIMIT ); ?> URLs</div>
          <button class="mw-btn-add" id="btn-add-url" onclick="gtmt.addUrlRow()" aria-label="Añadir fila de URL">+ Añadir URL</button>
        </div>

        <!-- TAB PATTERN -->
        <div id="tab-pattern" style="display:none" role="tabpanel">
          <div class="case-problem-box case-problem-box--info" style="margin-bottom:12px">
            <p class="case-problem-text" style="margin:0;font-size:0.82rem">Sustituye un prefijo o fragmento de forma masiva en todas las URLs.</p>
          </div>
          <div class="mw-pattern-row">
            <div>
              <p class="ds-decision-label" style="margin-bottom:6px">Texto a reemplazar</p>
              <input class="mw-input" id="pat-from" type="text" placeholder="/blog/" oninput="gtmt.previewPattern()" aria-label="Texto a reemplazar">
            </div>
            <div>
              <p class="ds-decision-label" style="margin-bottom:6px">Reemplazar por</p>
              <input class="mw-input" id="pat-to" type="text" placeholder="/articulos/" oninput="gtmt.previewPattern()" aria-label="Texto de sustitución">
            </div>
          </div>
          <p class="ds-decision-label" style="margin-bottom:6px">URLs origen (una por línea)</p>
          <textarea class="mw-textarea" id="pat-urls" oninput="gtmt.previewPattern()" aria-label="URLs a transformar" placeholder="https://ejemplo.com/blog/post-1/&#10;https://ejemplo.com/blog/post-2/"></textarea>
          <div class="mw-pattern-preview" id="pat-preview" aria-live="polite">El resultado de la transformación aparecerá aquí...</div>
          <button class="case-figma-btn case-figma-btn--outline" style="margin-top:12px;font-size:0.82rem;padding:10px 20px" onclick="gtmt.applyPattern()">Aplicar y añadir al mapeo</button>
        </div>

        <!-- TAB REGEX -->
        <div id="tab-regex" style="display:none" role="tabpanel">
          <div class="case-problem-box case-problem-box--info" style="margin-bottom:12px">
            <p class="case-problem-text" style="margin:0;font-size:0.82rem">Transformaciones avanzadas. Usa grupos de captura <code>$1</code>, <code>$2</code>...</p>
          </div>
          <div class="mw-pattern-row">
            <div>
              <p class="ds-decision-label" style="margin-bottom:6px">Patrón regex (origen)</p>
              <input class="mw-input" id="regex-from" type="text" placeholder="\/producto\/([^\/]+)\/" oninput="gtmt.previewRegex()" aria-label="Patrón regex">
            </div>
            <div>
              <p class="ds-decision-label" style="margin-bottom:6px">Reemplazar por</p>
              <input class="mw-input" id="regex-to" type="text" placeholder="/tienda/$1/" oninput="gtmt.previewRegex()" aria-label="Sustitución regex">
            </div>
          </div>
          <p class="ds-decision-label" style="margin-bottom:6px">URL de prueba</p>
          <input class="mw-input" id="regex-test" type="text" placeholder="https://ejemplo.com/producto/zapatillas-rojas/" oninput="gtmt.previewRegex()" aria-label="URL de prueba">
          <div class="mw-pattern-preview" id="regex-preview" aria-live="polite">Resultado del regex aparecerá aquí...</div>
        </div>

        <!-- TAB CSV -->
        <div id="tab-paste" style="display:none" role="tabpanel">
          <div class="case-problem-box case-problem-box--info" style="margin-bottom:12px">
            <p class="case-problem-text" style="margin:0;font-size:0.82rem">Formato: <code>URL_origen,URL_destino</code> — una por línea. La cabecera se detecta y omite automáticamente.</p>
          </div>
          <textarea class="mw-textarea" id="csv-paste" style="min-height:140px" aria-label="Pegar CSV" placeholder="https://ejemplo.com/pagina-antigua/,https://ejemplo.com/pagina-nueva/&#10;https://ejemplo.com/viejo/contacto,https://ejemplo.com/contacto/"></textarea>
          <button class="case-figma-btn case-figma-btn--outline" style="margin-top:12px;font-size:0.82rem;padding:10px 20px" onclick="gtmt.importCSV()">Importar al mapeo</button>
        </div>

      </div>
    </div>

    <!-- Vista previa del mapeo -->
    <div class="ds-component-card" id="mapping-preview-card" style="display:none;margin-bottom:16px">
      <div class="ds-component-header ds-component-header-accent">
        <div class="ds-component-number" style="background:var(--ds-navy);color:var(--ds-accent)">→</div>
        <p class="ds-component-title">Vista previa del mapeo</p>
      </div>
      <div class="ds-component-body" style="background:var(--ds-navy);overflow-x:auto">
        <table class="mw-table" aria-label="Tabla de mapeo de URLs">
          <thead>
            <tr>
              <th>URL Origen</th>
              <th style="text-align:center;width:36px">→</th>
              <th>URL Destino</th>
              <th style="text-align:center;width:64px">Estado</th>
            </tr>
          </thead>
          <tbody id="mapping-table-body"></tbody>
        </table>
      </div>
    </div>

    <div class="mw-actions">
      <button class="case-figma-btn case-figma-btn--outline" onclick="gtmt.goToPhase(2)">← Volver</button>
      <button class="case-figma-btn" onclick="gtmt.goToPhase(4)">Continuar → Generar redirecciones</button>
    </div>
  </div><!-- /phase-3 -->

  <!-- ===== FASE 4: REDIRECCIONES ===== -->
  <div class="mw-phase" id="phase-4">
    <div class="ds-component-card" style="margin-bottom:16px">
      <div class="ds-component-header ds-component-header-accent">
        <div class="ds-component-number">4</div>
        <p class="ds-component-title">Generador de redirecciones</p>
      </div>
      <div class="ds-component-body" style="background:var(--ds-navy)">
        <div id="server-diagram" style="margin-bottom:20px"></div>
        <div id="redir-output"></div>
        <div class="mw-divider"></div>
        <p class="ds-decision-label" style="margin-bottom:14px">Buenas prácticas para esta configuración</p>
        <div id="practices-container"></div>
      </div>
    </div>
    <div class="mw-actions">
      <button class="case-figma-btn case-figma-btn--outline" onclick="gtmt.goToPhase(3)">← Volver</button>
      <button class="case-figma-btn" onclick="gtmt.goToPhase(5)">Continuar → Exportar</button>
    </div>
  </div><!-- /phase-4 -->

  <!-- ===== FASE 5: EXPORTAR ===== -->
  <div class="mw-phase" id="phase-5">

    <div class="ds-component-card" style="margin-bottom:16px">
      <div class="ds-component-header ds-component-header-accent">
        <div class="ds-component-number">5</div>
        <p class="ds-component-title">Exportar resultados</p>
      </div>
      <div class="ds-component-body" style="background:var(--ds-navy)">
        <div class="mw-export-grid" id="export-grid"></div>
      </div>
    </div>

    <div class="ds-component-card" style="margin-bottom:16px">
      <div class="ds-component-header ds-component-header-accent">
        <div class="ds-component-number" style="background:var(--ds-navy);color:var(--ds-accent)">✓</div>
        <div>
          <p class="ds-component-title">Checklist de verificación posterior</p>
          <p style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin:0">Una vez ejecutada la migración, verifica estos puntos.</p>
        </div>
      </div>
      <div class="ds-component-body" style="background:var(--ds-navy)">
        <div id="post-checklist" role="list"></div>
      </div>
    </div>

    <div class="ds-component-card" style="margin-bottom:16px">
      <div class="ds-component-header ds-component-header-accent">
        <div class="ds-component-number" style="background:rgba(239,68,68,0.2);color:#f87171">!</div>
        <div>
          <p class="ds-component-title">Errores frecuentes y cómo evitarlos</p>
          <p style="font-size:0.82rem;color:rgba(255,255,255,0.6);margin:0">Los fallos más comunes en migraciones web.</p>
        </div>
      </div>
      <div class="ds-component-body" style="background:var(--ds-navy)">
        <div id="errors-container"></div>
      </div>
    </div>

    <div class="mw-actions">
      <button class="case-figma-btn case-figma-btn--outline" onclick="gtmt.goToPhase(4)">← Volver</button>
      <button class="case-figma-btn" onclick="gtmt.resetTool()">↺ Nueva migración</button>
    </div>
  </div><!-- /phase-5 -->

  <!-- ===== CRÉDITO ===== -->
  <div class="gtmt-credit" role="contentinfo">
    Herramienta desarrollada por
    <a href="<?php echo esc_url( GTMT_AUTHOR_URL ); ?>" target="_blank" rel="noopener author">Yel Martínez</a>
    — Greentech &middot;
    <a href="<?php echo esc_url( GTMT_GITHUB_URL ); ?>" target="_blank" rel="noopener">Versión completa en GitHub</a>
  </div>

</div><!-- /ds-container -->
</div><!-- /gtmt-wrapper -->

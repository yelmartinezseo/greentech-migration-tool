/**
 * Greentech Migration Tool — Script principal
 *
 * @package    GreentechMigrationTool
 * @author     Yel Martínez <https://yel-martinez-portfolio.com>
 * @version    1.0.0
 * @license    GPL-2.0-or-later
 *
 * Toda la lógica está encapsulada en el objeto global `gtmt`
 * para evitar colisiones con otros scripts de WordPress.
 * La configuración (límites, URLs) se inyecta via wp_localize_script
 * como `gtmtConfig` desde el plugin PHP.
 */

/* global gtmtConfig */
( function () {
	'use strict';

	// ============================================================
	// NAMESPACE PRINCIPAL
	// ============================================================
	const gtmt = {

		// ---- Estado ----
		config: {
			cms: 'wordpress',
			server: 'apache',
			volume: 'small',
			change: 'slug',
			domainchange: 'no',
			domainOrigin: '',
			domainDest: '',
		},

		urlMappings:    [],
		currentPhase:   1,
		checklistState: {},
		rowCount:       0,

		// ---- Constantes desde PHP ----
		URL_LIMIT:   ( typeof gtmtConfig !== 'undefined' && gtmtConfig.urlLimit )   ? parseInt( gtmtConfig.urlLimit, 10 ) : 50,
		GITHUB_URL:  ( typeof gtmtConfig !== 'undefined' && gtmtConfig.githubUrl )  ? gtmtConfig.githubUrl  : 'https://github.com/yelmartinez/greentech-migration-tool',
		CONTACT_URL: ( typeof gtmtConfig !== 'undefined' && gtmtConfig.contactUrl ) ? gtmtConfig.contactUrl : 'https://yel-martinez-portfolio.com/contacto/',
		AUTHOR_URL:  ( typeof gtmtConfig !== 'undefined' && gtmtConfig.authorUrl )  ? gtmtConfig.authorUrl  : 'https://yel-martinez-portfolio.com',

		// ============================================================
		// NAVEGACIÓN
		// ============================================================
		goToPhase( n ) {
			document.getElementById( 'phase-' + this.currentPhase ).classList.remove( 'active' );

			for ( let i = 1; i <= 5; i++ ) {
				const step = document.getElementById( 'ps-' + i );
				step.classList.remove( 'active', 'done' );
				if ( i < n ) step.classList.add( 'done' );
				if ( i === n ) step.classList.add( 'active' );
				if ( i < 5 ) {
					document.getElementById( 'pl-' + i ).classList.toggle( 'done', i < n );
				}
			}

			this.currentPhase = n;
			document.getElementById( 'phase-' + n ).classList.add( 'active' );

			if ( n === 2 ) this.buildChecklist();
			if ( n === 3 ) this.buildMappingPreview();
			if ( n === 4 ) this.buildRedirections();
			if ( n === 5 ) this.buildExport();

			// Scroll suave al inicio del widget
			const wrapper = document.getElementById( 'gtmt-app' );
			if ( wrapper ) wrapper.scrollIntoView( { behavior: 'smooth', block: 'start' } );
		},

		// ============================================================
		// FASE 1 — CONFIGURACIÓN
		// ============================================================
		selectOpt( el, group ) {
			const parent = el.closest( '.mw-opt-grid' );
			if ( parent ) parent.querySelectorAll( '.mw-opt' ).forEach( o => o.classList.remove( 'selected' ) );
			el.classList.add( 'selected' );
			this.config[ group ] = el.dataset.val;

			if ( group === 'domainchange' ) {
				document.getElementById( 'domain-fields' ).style.display =
					el.dataset.val === 'yes' ? 'block' : 'none';
			}
			if ( group === 'server' ) this.updateServerNote();
		},

		updateServerNote() {
			const notes = {
				apache:     'El archivo <strong>.htaccess</strong> funciona en Apache. Se coloca en la raíz del proyecto. Compatible con hosting compartido sin necesidad de acceso root.',
				nginx:      '<strong>Nginx no soporta .htaccess.</strong> Las redirecciones se configuran en el archivo de virtual host (<code>nginx.conf</code>). Necesitas acceso root o contactar al proveedor de hosting.',
				cloudflare: '<strong>Cloudflare</strong> gestiona redirecciones desde su Dashboard: <em>Rules → Redirect Rules</em> (o Page Rules, legacy). No se usa .htaccess para este propósito.',
				iis:        '<strong>IIS (Windows Server)</strong> usa el archivo <code>web.config</code> con sintaxis XML. Requiere el módulo <em>URL Rewrite</em> instalado previamente.',
				litespeed:  'LiteSpeed es <strong>compatible con .htaccess</strong> de Apache. Puedes usar exactamente la misma sintaxis. Habitual en cPanel y DirectAdmin.',
				noknow:     'Contacta con tu proveedor de hosting. La mayoría de hostings compartidos usan Apache o LiteSpeed y soportan <strong>.htaccess</strong>.',
			};
			const el = document.getElementById( 'server-note-text' );
			if ( el ) el.innerHTML = notes[ this.config.server ] || '';
		},

		// ============================================================
		// FASE 2 — CHECKLIST
		// ============================================================
		getChecklistItems() {
			const all = [
				{ id: 'backup',        text: 'Realiza un backup completo del sitio (archivos + base de datos)',                    tag: 'critical',     always: true },
				{ id: 'crawl',         text: 'Exporta un crawl completo con Screaming Frog, Sitebulb o similar',                  tag: 'critical',     always: true },
				{ id: 'gsc-export',    text: 'Exporta las URLs de Google Search Console (Performance → Páginas)',                  tag: 'critical',     always: true },
				{ id: 'ga-export',     text: 'Exporta las páginas con más tráfico de GA4 (últimos 12 meses)',                     tag: 'recommended',  always: true },
				{ id: 'sitemap',       text: 'Guarda el sitemap.xml actual como referencia de estado pre-migración',              tag: 'recommended',  always: true },
				{ id: 'canonicals',    text: 'Documenta las URLs con canonicals configurados',                                    tag: 'recommended',  always: true },
				{ id: 'indexadas',     text: 'Verifica cuántas URLs están indexadas (site:tudominio.com en Google)',              tag: 'recommended',  always: true },
				{ id: '301-check',     text: 'Comprueba si ya existen redirecciones 301 que puedan crear cadenas',               tag: 'critical',     always: true },
				{ id: 'htaccess-bkp', text: 'Guarda una copia del .htaccess actual antes de modificarlo',                       tag: 'critical',     server: [ 'apache', 'litespeed' ] },
				{ id: 'test-env',      text: 'Realiza la migración primero en un entorno de staging/pruebas',                    tag: 'critical',     always: true },
				{ id: 'ga4-annot',     text: 'Crea una anotación en GA4 marcando la fecha de la migración',                     tag: 'recommended',  always: true },
				{ id: 'gsc-verify',    text: 'Verifica la propiedad del nuevo dominio en Google Search Console',                 tag: 'critical',     change: [ 'domain', 'mixed' ] },
				{ id: 'change-addr',   text: 'Usa la herramienta "Cambio de dirección" en Google Search Console',               tag: 'critical',     change: [ 'domain', 'mixed' ] },
				{ id: 'ssl',           text: 'Verifica que el SSL/TLS está instalado y válido en el dominio destino',            tag: 'critical',     change: [ 'protocol', 'domain', 'mixed' ] },
				{ id: 'robots',        text: 'Comprueba que robots.txt no bloquea el nuevo dominio o estructura',                tag: 'critical',     always: true },
				{ id: 'notif-links',   text: 'Notifica a los principales sitios que te enlazan del cambio de URL',              tag: 'recommended',  change: [ 'domain', 'structure', 'mixed' ] },
				{ id: 'sitemaps-new',  text: 'Prepara el nuevo sitemap.xml con las URLs destino antes del lanzamiento',         tag: 'recommended',  always: true },
				{ id: 'cache',         text: 'Planifica cómo limpiar caché (CDN, servidor, WordPress, browser)',                 tag: 'recommended',  always: true },
				{ id: 'monitor',       text: 'Configura alertas de errores 404 en GSC para las primeras 48h',                   tag: 'critical',     always: true },
				{ id: 'hreflang',      text: 'Documenta y actualiza los atributos hreflang en las nuevas URLs',                 tag: 'critical',     change: [ 'lang', 'mixed' ] },
				{ id: 'json-ld',       text: 'Verifica que los datos estructurados (JSON-LD) referencian las nuevas URLs',      tag: 'recommended',  always: true },
				{ id: 'cwv',           text: 'Comprueba Core Web Vitals del nuevo servidor antes del lanzamiento',              tag: 'recommended',  always: true },
			];

			return all.filter( item => {
				if ( item.always ) return true;
				if ( item.server && ! item.server.includes( this.config.server ) ) return false;
				if ( item.change && ! item.change.includes( this.config.change ) ) return false;
				return true;
			} );
		},

		buildChecklist() {
			const items     = this.getChecklistItems();
			const container = document.getElementById( 'checklist-container' );
			container.innerHTML = '';

			items.forEach( item => {
				if ( this.checklistState[ item.id ] === undefined ) this.checklistState[ item.id ] = false;
				const div      = document.createElement( 'div' );
				div.className  = 'mw-check-item' + ( this.checklistState[ item.id ] ? ' checked' : '' );
				div.dataset.id = item.id;
				div.setAttribute( 'role', 'listitem' );
				div.onclick    = () => this.toggleCheck( item.id, div );
				const tagClass = item.tag === 'critical' ? 'tag-critical' : 'tag-recommended';
				const tagLabel = item.tag === 'critical' ? 'Crítico' : 'Recomendado';
				div.innerHTML  = `
					<div class="mw-check-box" aria-hidden="true">${ this.checklistState[ item.id ] ? '✓' : '' }</div>
					<div class="mw-check-text">${ this.escHtml( item.text ) }<span class="mw-check-tag ${ tagClass }">${ tagLabel }</span></div>`;
				container.appendChild( div );
			} );

			document.getElementById( 'stat-total' ).textContent = items.length;
			this.updateChecklistStats( items );
		},

		toggleCheck( id, el ) {
			this.checklistState[ id ] = ! this.checklistState[ id ];
			el.classList.toggle( 'checked', this.checklistState[ id ] );
			el.querySelector( '.mw-check-box' ).textContent = this.checklistState[ id ] ? '✓' : '';
			this.updateChecklistStats( this.getChecklistItems() );
		},

		updateChecklistStats( items ) {
			const done = items.filter( i => this.checklistState[ i.id ] ).length;
			document.getElementById( 'stat-done' ).textContent  = done;
			document.getElementById( 'stat-total' ).textContent = items.length;
			document.getElementById( 'stat-pct' ).textContent   = Math.round( ( done / items.length ) * 100 ) + '%';
		},

		// ============================================================
		// FASE 3 — MAPEO DE URLs
		// ============================================================
		addUrlRow( from = '', to = '' ) {
			if ( this.urlMappings.length >= this.URL_LIMIT ) {
				this.showLimitBanner();
				return;
			}
			this.rowCount++;
			const id  = this.rowCount;
			const div = document.createElement( 'div' );
			div.className  = 'mw-url-row';
			div.id         = 'row-' + id;
			div.setAttribute( 'role', 'listitem' );
			div.innerHTML  = `
				<input class="mw-input" type="url" placeholder="https://ejemplo.com/antiguo/" value="${ this.escAttr( from ) }" oninput="gtmt.updateMappings()" aria-label="URL origen">
				<div class="mw-url-arrow" aria-hidden="true">→</div>
				<input class="mw-input" type="url" placeholder="https://ejemplo.com/nuevo/" value="${ this.escAttr( to ) }" oninput="gtmt.updateMappings()" aria-label="URL destino">
				<button class="mw-btn-icon" onclick="gtmt.removeRow(${ id })" aria-label="Eliminar fila">✕</button>`;
			document.getElementById( 'url-rows' ).appendChild( div );
			if ( from && to ) this.updateMappings();
		},

		removeRow( id ) {
			const el = document.getElementById( 'row-' + id );
			if ( el ) el.remove();
			this.updateMappings();
		},

		updateMappings() {
			this.urlMappings = [];
			document.querySelectorAll( '.mw-url-row' ).forEach( row => {
				const inputs = row.querySelectorAll( 'input' );
				const from   = inputs[ 0 ].value.trim();
				const to     = inputs[ 1 ].value.trim();
				if ( from && to ) this.urlMappings.push( { from, to } );
			} );

			// Contador
			const counter = document.getElementById( 'url-count' );
			if ( counter ) counter.textContent = this.urlMappings.length;

			// Deshabilitar botón añadir si se alcanza el límite
			const addBtn = document.getElementById( 'btn-add-url' );
			if ( addBtn ) {
				addBtn.disabled = this.urlMappings.length >= this.URL_LIMIT;
				addBtn.style.opacity = this.urlMappings.length >= this.URL_LIMIT ? '0.4' : '1';
			}

			if ( this.urlMappings.length >= this.URL_LIMIT ) this.showLimitBanner();
			else this.hideLimitBanner();

			this.buildMappingPreview();
		},

		showLimitBanner() {
			const b = document.getElementById( 'gtmt-limit-banner' );
			if ( b ) b.classList.add( 'visible' );
		},
		hideLimitBanner() {
			const b = document.getElementById( 'gtmt-limit-banner' );
			if ( b ) b.classList.remove( 'visible' );
		},

		buildMappingPreview() {
			const card  = document.getElementById( 'mapping-preview-card' );
			const tbody = document.getElementById( 'mapping-table-body' );
			if ( this.urlMappings.length === 0 ) { card.style.display = 'none'; return; }
			card.style.display = 'block';
			tbody.innerHTML    = '';
			this.urlMappings.forEach( m => {
				const valid = m.from.startsWith( 'http' ) && m.to.startsWith( 'http' );
				const tr    = document.createElement( 'tr' );
				tr.innerHTML = `
					<td>${ this.escHtml( m.from ) }</td>
					<td class="td-arrow">→</td>
					<td>${ this.escHtml( m.to ) }</td>
					<td class="td-status">${ valid ? '<span class="mw-badge-ok">OK</span>' : '<span class="mw-badge-err">Revisar</span>' }</td>`;
				tbody.appendChild( tr );
			} );
		},

		switchTab( tab, el ) {
			[ 'manual', 'pattern', 'regex', 'paste' ].forEach( t => {
				document.getElementById( 'tab-' + t ).style.display = t === tab ? 'block' : 'none';
			} );
			document.querySelectorAll( '.mw-tab' ).forEach( t => {
				t.classList.remove( 'active' );
				t.setAttribute( 'aria-selected', 'false' );
			} );
			el.classList.add( 'active' );
			el.setAttribute( 'aria-selected', 'true' );
		},

		previewPattern() {
			const from    = document.getElementById( 'pat-from' ).value;
			const to      = document.getElementById( 'pat-to' ).value;
			const urls    = document.getElementById( 'pat-urls' ).value.trim().split( '\n' ).filter( Boolean );
			const preview = document.getElementById( 'pat-preview' );
			if ( ! from || ! urls.length ) { preview.innerHTML = 'Resultado aquí...'; return; }
			const results = urls.slice( 0, 5 ).map( u => {
				const result = u.split( from ).join( to );
				return this.escHtml( u ) + '\n  → <span>' + this.escHtml( result ) + '</span>';
			} ).join( '\n\n' );
			preview.innerHTML = results + ( urls.length > 5 ? `\n\n...y ${ urls.length - 5 } más` : '' );
		},

		applyPattern() {
			const from = document.getElementById( 'pat-from' ).value;
			const to   = document.getElementById( 'pat-to' ).value;
			const urls = document.getElementById( 'pat-urls' ).value.trim().split( '\n' ).filter( Boolean );
			urls.forEach( u => this.addUrlRow( u, u.split( from ).join( to ) ) );
			this.switchTab( 'manual', document.querySelectorAll( '.mw-tab' )[ 0 ] );
			this.updateMappings();
		},

		previewRegex() {
			const from    = document.getElementById( 'regex-from' ).value;
			const to      = document.getElementById( 'regex-to' ).value;
			const test    = document.getElementById( 'regex-test' ).value;
			const preview = document.getElementById( 'regex-preview' );
			if ( ! from || ! test ) { preview.innerHTML = 'Introduce un patrón y URL de prueba'; return; }
			try {
				const re     = new RegExp( from );
				const result = test.replace( re, to );
				preview.innerHTML = '<span>' + this.escHtml( test ) + '</span>\n→ <span>' + this.escHtml( result ) + '</span>';
			} catch ( e ) {
				preview.innerHTML = '<span style="color:#f87171">Error en regex: ' + this.escHtml( e.message ) + '</span>';
			}
		},

		importCSV() {
			const raw   = document.getElementById( 'csv-paste' ).value.trim();
			const lines = raw.split( '\n' ).filter( Boolean );
			lines.forEach( line => {
				const parts = line.split( ',' );
				if ( parts.length >= 2 ) {
					const from = parts[ 0 ].trim().replace( /^"|"$/g, '' );
					const to   = parts.slice( 1 ).join( ',' ).trim().replace( /^"|"$/g, '' );
					if ( from && to && ! from.toLowerCase().startsWith( 'url' ) ) {
						this.addUrlRow( from, to );
					}
				}
			} );
			this.switchTab( 'manual', document.querySelectorAll( '.mw-tab' )[ 0 ] );
			this.updateMappings();
		},

		// ============================================================
		// FASE 4 — REDIRECCIONES
		// ============================================================
		buildRedirections() {
			this.buildServerDiagram();
			this.buildRedirCode();
			this.buildPractices();
		},

		buildServerDiagram() {
			const d = document.getElementById( 'server-diagram' );
			const diagrams = {
				apache: `<div class="case-problem-box case-problem-box--info" style="margin-bottom:0">
					<p class="case-problem-title case-problem-title--info">Dónde añadir las redirecciones en Apache</p>
					<div class="mw-diagram-row">📁 Raíz del proyecto <span style="color:var(--ds-accent)">→</span> <span class="path">.htaccess</span> <span style="color:#4ade80;font-size:0.78rem">✓ Sin acceso root</span></div>
					<div class="mw-diagram-row" style="font-size:0.78rem">También en: <span class="path">httpd.conf</span> o <span class="path">VirtualHost</span> (requiere root, mejor rendimiento con muchas reglas)</div>
					<p class="case-problem-text" style="margin:0;font-size:0.8rem;margin-top:8px">Verifica que <code>AllowOverride</code> esté en <code>All</code> en la configuración de Apache. El .htaccess se procesa en cada petición; con cientos de reglas, considera moverlas al VirtualHost.</p>
				</div>`,
				nginx: `<div class="case-problem-box" style="margin-bottom:0;border-left-color:#f87171">
					<p class="case-problem-title" style="color:#f87171">Dónde añadir las redirecciones en Nginx</p>
					<div class="mw-diagram-row">📁 <span class="path">/etc/nginx/sites-available/tudominio</span></div>
					<div class="mw-diagram-row" style="font-size:0.78rem">O en: <span class="path">/etc/nginx/nginx.conf</span> dentro del bloque <code>server {}</code></div>
					<p class="case-problem-text" style="margin:0;font-size:0.8rem;margin-top:8px">Nginx NO soporta .htaccess. Tras editar, valida con <code>nginx -t</code> y aplica con <code>systemctl reload nginx</code> (no restart, para no interrumpir conexiones activas).</p>
				</div>`,
				cloudflare: `<div class="case-problem-box case-problem-box--info" style="margin-bottom:0">
					<p class="case-problem-title case-problem-title--info">Dónde añadir las redirecciones en Cloudflare</p>
					<div class="mw-diagram-row">🌐 Dashboard <span style="color:var(--ds-accent)">→</span> Tu zona <span style="color:var(--ds-accent)">→</span> <span class="path">Rules → Redirect Rules</span></div>
					<div class="mw-diagram-row" style="font-size:0.78rem">Alternativa (legacy): <span class="path">Page Rules</span> — limitado a 3 en plan gratuito</div>
					<p class="case-problem-text" style="margin:0;font-size:0.8rem;margin-top:8px">Las redirecciones Cloudflare se ejecutan antes de llegar al servidor de origen. Ideales para cambios de dominio o protocolo. Para cambios de slug, configúralo mejor en el servidor de origen.</p>
				</div>`,
				iis: `<div class="case-problem-box case-problem-box--info" style="margin-bottom:0">
					<p class="case-problem-title case-problem-title--info">Dónde añadir las redirecciones en IIS</p>
					<div class="mw-diagram-row">📁 Raíz del sitio <span style="color:var(--ds-accent)">→</span> <span class="path">web.config</span></div>
					<p class="case-problem-text" style="margin:0;font-size:0.8rem;margin-top:8px">Requiere el módulo <strong>URL Rewrite</strong> instalado en IIS (Web Platform Installer). Sin él, las reglas de reescritura no funcionan. Verifica también los permisos del Application Pool.</p>
				</div>`,
				litespeed: `<div class="case-problem-box case-problem-box--info" style="margin-bottom:0">
					<p class="case-problem-title case-problem-title--info">Dónde añadir las redirecciones en LiteSpeed</p>
					<div class="mw-diagram-row">📁 Raíz del proyecto <span style="color:var(--ds-accent)">→</span> <span class="path">.htaccess</span> <span style="color:#4ade80;font-size:0.78rem">✓ Compatible Apache</span></div>
					<p class="case-problem-text" style="margin:0;font-size:0.8rem;margin-top:8px">LiteSpeed procesa las reglas .htaccess de Apache con igual sintaxis y mejor rendimiento. No requiere cambios respecto a Apache.</p>
				</div>`,
				noknow: `<div class="case-problem-box" style="margin-bottom:0;border-left-color:var(--ds-accent)">
					<p class="case-problem-title" style="color:var(--ds-accent-dark,#e6c73b)">Servidor desconocido</p>
					<p class="case-problem-text" style="margin:0;font-size:0.82rem">Contacta con tu proveedor de hosting. Los hostings compartidos (SiteGround, Hostinger, OVH, Raiola...) suelen usar Apache o LiteSpeed y soportan <strong>.htaccess</strong>. El código generado usa sintaxis Apache como punto de partida.</p>
				</div>`,
			};
			d.innerHTML = diagrams[ this.config.server ] || diagrams.noknow;
		},

		buildRedirCode() {
			const container = document.getElementById( 'redir-output' );
			if ( this.urlMappings.length === 0 ) {
				container.innerHTML = '<div class="case-problem-box" style="border-left-color:var(--ds-accent)"><p class="case-problem-title" style="color:var(--ds-accent-dark,#e6c73b)">Sin mapeos definidos</p><p class="case-problem-text" style="margin:0">Vuelve al paso anterior para añadir las redirecciones.</p></div>';
				return;
			}
			const generators = { apache: () => this.genApache(), litespeed: () => this.genApache(), nginx: () => this.genNginx(), cloudflare: () => this.genCloudflare(), iis: () => this.genIIS(), noknow: () => this.genApache() };
			const labels     = { apache: '.htaccess (Apache)', litespeed: '.htaccess (LiteSpeed)', nginx: 'nginx.conf — bloque server {}', cloudflare: 'Cloudflare Redirect Rules (JSON)', iis: 'web.config (IIS)', noknow: '.htaccess (Apache — más probable)' };
			const fn         = generators[ this.config.server ] || generators.apache;
			const code       = fn();
			container.innerHTML = `
				<div class="mw-code-header">
					<span class="mw-code-label">${ this.escHtml( labels[ this.config.server ] || '.htaccess' ) }</span>
					<button class="case-figma-btn case-figma-btn--outline" style="font-size:0.75rem;padding:6px 14px" onclick="gtmt.copyCode('main-code')">Copiar</button>
				</div>
				<div class="mw-code-block" id="main-code">${ this.escHtml( code ) }</div>`;
		},

		genApache() {
			const d = new Date().toLocaleDateString( 'es-ES' );
			const lines = [ `# Redirecciones 301 — Greentech Migration Tool`, `# Autor: Yel Martínez — yel-martinez-portfolio.com`, `# Servidor: Apache/LiteSpeed | Fecha: ${ d }`, '', 'RewriteEngine On', '' ];
			if ( [ 'protocol', 'mixed' ].includes( this.config.change ) ) {
				lines.push( '# Forzar HTTPS', 'RewriteCond %{HTTPS} off', 'RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]', '' );
			}
			if ( this.config.domainchange === 'yes' && this.config.domainOrigin && this.config.domainDest ) {
				const old = this.config.domainOrigin.replace( /https?:\/\//, '' ).replace( /\/$/, '' );
				const nw  = this.config.domainDest.replace( /https?:\/\//, '' ).replace( /\/$/, '' );
				lines.push( '# Redirección de dominio completo', `RewriteCond %{HTTP_HOST} ^${ old.replace( /\./g, '\\.' ) }$ [NC]`, `RewriteRule ^(.*)$ https://${ nw }/$1 [R=301,L]`, '' );
			}
			lines.push( '# Redirecciones individuales de URLs' );
			this.urlMappings.forEach( m => {
				try { const u = new URL( m.from ); lines.push( `Redirect 301 ${ u.pathname } ${ m.to }` ); }
				catch { lines.push( `# ERROR URL inválida: ${ m.from }` ); }
			} );
			return lines.join( '\n' );
		},

		genNginx() {
			const d     = new Date().toLocaleDateString( 'es-ES' );
			const lines = [ `# Redirecciones Nginx — bloque server {}`, `# Autor: Yel Martínez — yel-martinez-portfolio.com`, `# Fecha: ${ d }`, '' ];
			if ( [ 'protocol', 'mixed' ].includes( this.config.change ) ) {
				lines.push( '# HTTP → HTTPS', 'server {', '    listen 80;', '    server_name _;', '    return 301 https://$host$request_uri;', '}', '' );
			}
			if ( this.config.domainchange === 'yes' && this.config.domainOrigin && this.config.domainDest ) {
				const old = this.config.domainOrigin.replace( /https?:\/\//, '' ).replace( /\/$/, '' );
				const nw  = this.config.domainDest.replace( /https?:\/\//, '' ).replace( /\/$/, '' );
				lines.push( '# Redirección de dominio', 'server {', `    server_name ${ old };`, `    return 301 https://${ nw }$request_uri;`, '}', '' );
			}
			lines.push( '# Redirecciones individuales (dentro de tu bloque server {} principal)' );
			this.urlMappings.forEach( m => {
				try { const u = new URL( m.from ); lines.push( `location = ${ u.pathname } {`, `    return 301 ${ m.to };`, '}' ); }
				catch { lines.push( `# ERROR URL inválida: ${ m.from }` ); }
			} );
			return lines.join( '\n' );
		},

		genCloudflare() {
			const rules = this.urlMappings.map( m => ( {
				description: `${ m.from } → ${ m.to }`,
				action:      { type: 'redirect', value: { url: m.to, status_code: 301 } },
				conditions:  [ { field: 'uri_full', operator: 'equals', value: m.from } ],
			} ) );
			return JSON.stringify( rules, null, 2 ) + '\n\n// Importa desde Dashboard → Rules → Redirect Rules';
		},

		genIIS() {
			const rules = this.urlMappings.map( m => {
				try {
					const u = new URL( m.from );
					const p = u.pathname.replace( /^\//, '' );
					return `        <rule name="Redirect ${ p }" stopProcessing="true">\n            <match url="^${ p.replace( /\//g, '\\/' ) }$" />\n            <action type="Redirect" url="${ m.to }" redirectType="Permanent" />\n        </rule>`;
				} catch { return `        <!-- ERROR URL inválida: ${ m.from } -->`; }
			} ).join( '\n' );
			return `<?xml version="1.0" encoding="UTF-8"?>\n<configuration>\n    <system.webServer>\n        <rewrite>\n            <rules>\n${ rules }\n            </rules>\n        </rewrite>\n    </system.webServer>\n</configuration>`;
		},

		// ============================================================
		// FASE 4 — BUENAS PRÁCTICAS
		// ============================================================
		buildPractices() {
			const practs = this.getPractices();
			document.getElementById( 'practices-container' ).innerHTML = practs.map( p =>
				`<div class="case-problem-box case-problem-box--info" style="margin-bottom:10px">
					<p class="case-problem-title case-problem-title--info" style="font-size:0.88rem">${ p.icon } ${ this.escHtml( p.title ) }</p>
					<p class="case-problem-text" style="margin:0;font-size:0.82rem">${ p.text }</p>
				</div>`
			).join( '' );
		},

		getPractices() {
			const base = [
				{ icon: '🔗', title: 'Evita cadenas de redirecciones', text: 'Redirige siempre de A directo a C, nunca A→B→C. Las cadenas consumen link equity y ralentizan la carga. Antes de añadir nuevas reglas, audita las existentes para evitar loops.' },
				{ icon: '📊', title: 'Prioriza URLs por tráfico e impacto', text: 'Céntrate primero en páginas con más clics, impresiones y backlinks externos. Las páginas sin tráfico ni enlaces son menos críticas para el SEO.' },
				{ icon: '🚫', title: 'No redirigir 404s a la portada', text: 'Google lo penaliza como "soft 404". Cada URL debe redirigirse a su equivalente temático más cercano — nunca a la home como destino genérico.' },
				{ icon: '🗺️', title: 'Actualiza el sitemap.xml', text: 'Tras la migración, actualiza el sitemap con las nuevas URLs y envíalo a Google Search Console. Solo debe contener URLs canonicales sin redirigir.' },
				{ icon: '🔍', title: 'Actualiza los enlaces internos', text: 'Las 301 funcionan, pero lo óptimo es actualizar los enlaces internos para que apunten directamente a las nuevas URLs. Reduce carga en el servidor y mejora el rastreo.' },
				{ icon: '⏱️', title: 'Monitoriza durante 30 días mínimo', text: 'La mayoría de problemas aparecen en las primeras 4 semanas. Configura alertas y revisa Google Search Console cada 2-3 días tras la migración.' },
			];
			const serverExtras = {
				nginx:      { icon: '⚡', title: 'Valida la configuración Nginx antes de recargar', text: 'Ejecuta siempre <code>nginx -t</code> antes de recargar. Un error de sintaxis puede tumbar el servidor completo. Usa <code>systemctl reload nginx</code> para no interrumpir conexiones activas.' },
				cloudflare: { icon: '🌐', title: 'Orden de las reglas en Cloudflare', text: 'Las reglas se ejecutan en orden. Las más específicas deben ir antes que las genéricas. Las Redirect Rules tienen prioridad sobre las Page Rules (legacy).' },
				iis:        { icon: '🪟', title: 'Módulo URL Rewrite en IIS', text: 'Sin este módulo instalado, las reglas del web.config no funcionan. Instálalo desde el Web Platform Installer oficial de Microsoft IIS.' },
			};
			if ( serverExtras[ this.config.server ] ) base.splice( 2, 0, serverExtras[ this.config.server ] );
			return base;
		},

		// ============================================================
		// FASE 5 — EXPORTAR
		// ============================================================
		buildExport() {
			this.buildExportGrid();
			this.buildPostChecklist();
			this.buildErrorGuide();
		},

		buildExportGrid() {
			const labels  = { apache: '.htaccess', nginx: 'nginx.conf', cloudflare: 'CF Rules JSON', iis: 'web.config', litespeed: '.htaccess', noknow: '.htaccess' };
			const exports = [
				{ icon: '📄', name: labels[ this.config.server ] || '.htaccess', desc: 'Reglas de servidor', action: 'downloadServerFile' },
				{ icon: '📊', name: 'Mapeo CSV',       desc: `${ this.urlMappings.length } URLs`,  action: 'downloadCSV' },
				{ icon: '✅', name: 'Checklist .txt',  desc: 'Imprimible pre/post',                 action: 'downloadChecklist' },
				{ icon: '📋', name: 'Informe HTML',    desc: 'Resumen completo',                    action: 'downloadReport' },
			];
			document.getElementById( 'export-grid' ).innerHTML = exports.map( e =>
				`<div class="mw-export-card" onclick="gtmt.${ e.action }()" role="button" tabindex="0" aria-label="Descargar ${ e.name }">
					<div class="icon">${ e.icon }</div>
					<div class="name">${ this.escHtml( e.name ) }</div>
					<div class="desc">${ this.escHtml( e.desc ) }</div>
				</div>`
			).join( '' );
		},

		downloadServerFile() {
			const fns   = { apache: () => this.genApache(), litespeed: () => this.genApache(), nginx: () => this.genNginx(), cloudflare: () => this.genCloudflare(), iis: () => this.genIIS(), noknow: () => this.genApache() };
			const names = { apache: '.htaccess', nginx: 'nginx-redirects.conf', cloudflare: 'cloudflare-rules.json', iis: 'web.config', litespeed: '.htaccess', noknow: '.htaccess' };
			this.downloadText( ( fns[ this.config.server ] || fns.apache )(), names[ this.config.server ] || '.htaccess', 'text/plain' );
		},

		downloadCSV() {
			const lines = [ 'URL Origen,URL Destino,Estado' ];
			this.urlMappings.forEach( m => {
				const ok = m.from.startsWith( 'http' ) && m.to.startsWith( 'http' );
				lines.push( `"${ m.from }","${ m.to }","${ ok ? 'OK' : 'Revisar' }"` );
			} );
			this.downloadText( lines.join( '\n' ), 'mapeo-urls-migracion.csv', 'text/csv' );
		},

		downloadChecklist() {
			const items = this.getChecklistItems();
			let txt = `CHECKLIST MIGRACIÓN WEB — Greentech\nAutor herramienta: Yel Martínez — yel-martinez-portfolio.com\nFecha: ${ new Date().toLocaleDateString( 'es-ES' ) }\n`;
			txt += `CMS: ${ this.config.cms } | Servidor: ${ this.config.server } | Volumen: ${ this.config.volume }\n\n== CHECKLIST PREVIA ==\n`;
			items.forEach( i => { txt += `${ this.checklistState[ i.id ] ? '[X]' : '[ ]' } [${ i.tag.toUpperCase() }] ${ i.text }\n`; } );
			txt += '\n== CHECKLIST POSTERIOR ==\n';
			this.getPostChecklistItems().forEach( i => { txt += `[ ] [${ i.tag.toUpperCase() }] ${ i.text }\n`; } );
			this.downloadText( txt, 'checklist-migracion.txt', 'text/plain' );
		},

		downloadReport() {
			const items = this.getChecklistItems();
			const done  = items.filter( i => this.checklistState[ i.id ] ).length;
			const fns   = { apache: () => this.genApache(), litespeed: () => this.genApache(), nginx: () => this.genNginx(), cloudflare: () => this.genCloudflare(), iis: () => this.genIIS(), noknow: () => this.genApache() };
			const code  = this.urlMappings.length > 0 ? ( fns[ this.config.server ] || fns.apache )() : '# Sin mapeos definidos';
			const html  = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Informe Migración Web — Greentech</title>
<style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#222}h1{color:#1a1830;border-bottom:3px solid #f5d645;padding-bottom:10px}h2{color:#1a1830;margin-top:30px}table{width:100%;border-collapse:collapse;margin-top:10px}th{background:#1a1830;color:#f5d645;padding:8px 12px;text-align:left;font-size:.8rem}td{padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:.82rem}pre{background:#f5f5f5;padding:16px;border-radius:8px;overflow-x:auto;font-size:.8rem}.done{color:#16a34a}.pending{color:#9ca3af}footer{margin-top:40px;padding-top:16px;border-top:1px solid #eee;color:#9ca3af;font-size:.8rem}</style>
</head><body>
<h1>Informe de Migración Web</h1>
<p><strong>Herramienta:</strong> Greentech Migration Tool | <strong>Autor:</strong> <a href="https://yel-martinez-portfolio.com">Yel Martínez</a></p>
<p><strong>Fecha:</strong> ${ new Date().toLocaleDateString( 'es-ES' ) } | <strong>CMS:</strong> ${ this.config.cms } | <strong>Servidor:</strong> ${ this.config.server }</p>
<h2>Checklist previa (${ done }/${ items.length })</h2><ul>${ items.map( i => `<li class="${ this.checklistState[ i.id ] ? 'done' : 'pending' }">${ this.checklistState[ i.id ] ? '✓' : '○' } [${ i.tag }] ${ i.text }</li>` ).join( '' ) }</ul>
<h2>Mapeo de URLs (${ this.urlMappings.length })</h2>${ this.urlMappings.length > 0 ? `<table><tr><th>Origen</th><th>Destino</th></tr>${ this.urlMappings.map( m => `<tr><td>${ m.from }</td><td>${ m.to }</td></tr>` ).join( '' ) }</table>` : '<p>Sin mapeos definidos.</p>' }
<h2>Código de redirecciones</h2><pre>${ code.replace( /</g, '&lt;' ).replace( />/g, '&gt;' ) }</pre>
<footer>Generado por <a href="https://yel-martinez-portfolio.com">Greentech Migration Tool</a> de Yel Martínez &mdash; GPL-2.0-or-later</footer>
</body></html>`;
			this.downloadText( html, 'informe-migracion-web.html', 'text/html' );
		},

		downloadText( content, filename, type ) {
			const a     = document.createElement( 'a' );
			a.href      = URL.createObjectURL( new Blob( [ content ], { type } ) );
			a.download  = filename;
			a.click();
			setTimeout( () => URL.revokeObjectURL( a.href ), 5000 );
		},

		// ============================================================
		// CHECKLIST POSTERIOR
		// ============================================================
		buildPostChecklist() {
			const items = this.getPostChecklistItems();
			const c     = document.getElementById( 'post-checklist' );
			c.innerHTML = '';
			items.forEach( item => {
				const div     = document.createElement( 'div' );
				div.className = 'mw-check-item';
				div.setAttribute( 'role', 'listitem' );
				div.onclick   = function () {
					this.classList.toggle( 'checked' );
					this.querySelector( '.mw-check-box' ).textContent = this.classList.contains( 'checked' ) ? '✓' : '';
				};
				const tagClass = item.tag === 'critical' ? 'tag-critical' : 'tag-recommended';
				const tagLabel = item.tag === 'critical' ? 'Crítico' : 'Recomendado';
				div.innerHTML  = `<div class="mw-check-box" aria-hidden="true"></div><div class="mw-check-text">${ this.escHtml( item.text ) }<span class="mw-check-tag ${ tagClass }">${ tagLabel }</span></div>`;
				c.appendChild( div );
			} );
		},

		getPostChecklistItems() {
			return [
				{ text: 'Comprueba que las redirecciones responden 301 (usa curl -I o httpstatus.io)',                    tag: 'critical' },
				{ text: 'Verifica que no hay bucles (A→B→A) ni cadenas largas (A→B→C→D)',                               tag: 'critical' },
				{ text: 'Rastrea el nuevo sitio con Screaming Frog para detectar 404 residuales',                        tag: 'critical' },
				{ text: 'Envía el nuevo sitemap.xml a Google Search Console',                                            tag: 'critical' },
				{ text: 'Solicita indexación de las URLs más importantes desde GSC',                                     tag: 'recommended' },
				{ text: 'Verifica que GA4 registra sesiones correctamente en las nuevas URLs',                           tag: 'critical' },
				{ text: 'Comprueba Core Web Vitals del nuevo servidor (PageSpeed Insights)',                              tag: 'recommended' },
				{ text: 'Valida datos estructurados (JSON-LD) en las nuevas URLs con Rich Results Test',                 tag: 'recommended' },
				{ text: 'Verifica que robots.txt no bloquea recursos importantes del nuevo sitio',                       tag: 'critical' },
				{ text: 'Comprueba rankings de keywords principales a los 7, 14 y 30 días post-migración',               tag: 'recommended' },
				{ text: 'Revisa cobertura de indexación en GSC en los primeros 7-14 días',                               tag: 'critical' },
				{ text: 'Contacta a sitios con backlinks de alto valor para actualizar sus enlaces directamente',         tag: 'recommended' },
			];
		},

		buildErrorGuide() {
			const errors = [
				{ icon: '🔄', title: 'Bucle de redirecciones (Redirect Loop)',       desc: 'Causas: reglas conflictivas o circulares. Diagnóstico: <code>curl -L -v URL</code>. Solución: ninguna URL destino debe apuntar de vuelta a una URL origen ya redirigida.' },
				{ icon: '🔗', title: 'Cadena de redirecciones (Redirect Chain)',      desc: 'Causas: añadir nuevas reglas sobre antiguas sin consolidar. Impacto: pérdida de link equity. Mapea siempre desde la URL original hasta la URL final directamente.' },
				{ icon: '🏠', title: 'Soft 404 — redirigir 404s a la portada',       desc: 'Google lo penaliza como soft 404 y puede desindexar esas páginas. Redirige cada URL a su equivalente temático más cercano, nunca a la home como destino genérico.' },
				{ icon: '🚫', title: 'Redirecciones que no responden 301',            desc: 'En Apache: verifica que <code>mod_rewrite</code> está activo y <code>AllowOverride All</code> está configurado. Diagnóstico: <code>curl -I URL</code>.' },
				{ icon: '📁', title: '.htaccess no se aplica',                        desc: 'Causa más frecuente: <code>AllowOverride None</code> en Apache. Pide al hosting que lo habilite, o añade las reglas directamente al VirtualHost.' },
				{ icon: '🐢', title: 'Rendimiento degradado post-migración',          desc: 'Causas: demasiadas reglas en .htaccess, servidor más lento. Solución: consolida reglas, muévelas al VirtualHost, activa caché y CDN.' },
				{ icon: '🗺️', title: 'GSC no recoge las nuevas URLs',                 desc: 'Causas: sitemap no actualizado, robots.txt bloqueante. Envía el sitemap manualmente, solicita recrawl de URLs prioritarias y verifica robots.txt.' },
				{ icon: '🌐', title: 'Problemas con certificado SSL',                 desc: 'Causas: SSL no instalado, caducado, o mixed content. Verifica en sslshopper.com y corrige todas las referencias <code>http://</code> en el contenido.' },
			];
			document.getElementById( 'errors-container' ).innerHTML = errors.map( e =>
				`<div class="case-problem-box case-problem-box--info" style="margin-bottom:10px">
					<p class="case-problem-title case-problem-title--info" style="font-size:0.88rem">${ e.icon } ${ this.escHtml( e.title ) }</p>
					<p class="case-problem-text" style="margin:0;font-size:0.82rem">${ e.desc }</p>
				</div>`
			).join( '' );
		},

		// ============================================================
		// UTILIDADES
		// ============================================================
		copyCode( id ) {
			const el = document.getElementById( id );
			if ( ! el ) return;
			navigator.clipboard.writeText( el.textContent ).then( () => {
				const btn = el.previousElementSibling && el.previousElementSibling.querySelector( 'button' );
				if ( btn ) { btn.textContent = '¡Copiado!'; setTimeout( () => { btn.textContent = 'Copiar'; }, 2000 ); }
			} ).catch( () => {
				// Fallback para navegadores sin clipboard API
				const ta = document.createElement( 'textarea' );
				ta.value = el.textContent;
				document.body.appendChild( ta );
				ta.select();
				document.execCommand( 'copy' );
				document.body.removeChild( ta );
			} );
		},

		escHtml( str ) {
			return String( str )
				.replace( /&/g, '&amp;' )
				.replace( /</g, '&lt;' )
				.replace( />/g, '&gt;' )
				.replace( /"/g, '&quot;' );
		},

		escAttr( str ) {
			return String( str )
				.replace( /"/g, '&quot;' )
				.replace( /'/g, '&#39;' );
		},

		resetTool() {
			this.config       = { cms: 'wordpress', server: 'apache', volume: 'small', change: 'slug', domainchange: 'no', domainOrigin: '', domainDest: '' };
			this.urlMappings  = [];
			this.checklistState = {};
			this.rowCount     = 0;
			document.getElementById( 'url-rows' ).innerHTML = '';
			this.hideLimitBanner();
			this.goToPhase( 1 );
		},

		// ============================================================
		// INIT
		// ============================================================
		init() {
			this.addUrlRow();
			this.addUrlRow();
			this.updateServerNote();
		},
	};

	// Exponer globalmente para los onclick del HTML
	window.gtmt = gtmt;

	// Iniciar cuando el DOM esté listo
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', () => gtmt.init() );
	} else {
		gtmt.init();
	}

} )();

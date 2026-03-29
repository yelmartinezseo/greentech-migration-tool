<?php
/**
 * Plugin Name:       Greentech Migration Tool
 * Plugin URI:        https://yel-martinez-portfolio.com/mapeo-automatizado-de-urls-para-migraciones-web/
 * Description:       Herramienta interactiva de planificación y mapeo de URLs para migraciones web. Genera redirecciones 301 para Apache, Nginx, Cloudflare e IIS con checklist pre y post migración. Versión pública limitada a 50 URLs. Para proyectos de mayor volumen, descarga la versión completa desde GitHub.
 * Version:           1.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Yel Martínez
 * Author URI:        https://yel-martinez-portfolio.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       greentech-migration-tool
 * Domain Path:       /languages
 * Tags:              migración web, redirecciones 301, SEO técnico, mapeo de URLs, htaccess
 *
 * @package           GreentechMigrationTool
 * @author            Yel Martínez <hola@yel-martinez-portfolio.com>
 * @copyright         2025 Yel Martínez — Greentech
 * @license           GPL-2.0-or-later
 *
 * This plugin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * This plugin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Bloquea acceso directo al archivo.
}

// ============================================================
// CONSTANTES
// ============================================================
define( 'GTMT_VERSION',      '1.0.0' );
define( 'GTMT_PLUGIN_DIR',   plugin_dir_path( __FILE__ ) );
define( 'GTMT_PLUGIN_URL',   plugin_dir_url( __FILE__ ) );
define( 'GTMT_URL_LIMIT',    50 );   // Límite de URLs en versión pública
define( 'GTMT_AUTHOR_URL',   'https://yel-martinez-portfolio.com' );
define( 'GTMT_GITHUB_URL',   'https://github.com/yelmartinez/greentech-migration-tool' );
define( 'GTMT_CONTACT_URL',  'https://yel-martinez-portfolio.com/contacto/' );
define( 'GTMT_TOOL_URL',     'https://yel-martinez-portfolio.com/mapeo-automatizado-de-urls-para-migraciones-web/' );

// ============================================================
// REGISTRO DE SHORTCODE Y ASSETS
// ============================================================

/**
 * Registra los assets del plugin (CSS y JS).
 * Solo se encolan cuando el shortcode está presente en la página.
 */
function gtmt_register_assets() {
	wp_register_style(
		'gtmt-style',
		GTMT_PLUGIN_URL . 'assets/gtmt-style.css',
		array(),
		GTMT_VERSION
	);

	wp_register_script(
		'gtmt-script',
		GTMT_PLUGIN_URL . 'assets/gtmt-script.js',
		array(),
		GTMT_VERSION,
		true // Cargar en footer
	);

	// Pasa configuración PHP → JS de forma segura (sin inline hardcodeado)
	wp_localize_script( 'gtmt-script', 'gtmtConfig', array(
		'urlLimit'    => GTMT_URL_LIMIT,
		'githubUrl'   => GTMT_GITHUB_URL,
		'contactUrl'  => GTMT_CONTACT_URL,
		'authorUrl'   => GTMT_AUTHOR_URL,
		'toolUrl'     => GTMT_TOOL_URL,
		'nonce'       => wp_create_nonce( 'gtmt_nonce' ),
	) );
}
add_action( 'wp_enqueue_scripts', 'gtmt_register_assets' );

/**
 * Shortcode principal: [greentech_migration]
 *
 * @return string HTML de la herramienta.
 */
function gtmt_render_shortcode() {
	// Encola assets solo cuando se usa el shortcode
	wp_enqueue_style( 'gtmt-style' );
	wp_enqueue_script( 'gtmt-script' );

	ob_start();
	include GTMT_PLUGIN_DIR . 'templates/tool.php';
	return ob_get_clean();
}
add_shortcode( 'greentech_migration', 'gtmt_render_shortcode' );

// ============================================================
// METADATOS Y LINKS EN PANEL DE PLUGINS
// ============================================================

/**
 * Añade links útiles en la fila del plugin en wp-admin → Plugins.
 *
 * @param array  $links Links existentes.
 * @param string $file  Archivo del plugin.
 * @return array
 */
function gtmt_plugin_action_links( $links, $file ) {
	if ( plugin_basename( __FILE__ ) === $file ) {
		$custom = array(
			'<a href="' . esc_url( GTMT_TOOL_URL ) . '" target="_blank">Ver herramienta</a>',
			'<a href="' . esc_url( GTMT_GITHUB_URL ) . '" target="_blank">GitHub</a>',
		);
		$links = array_merge( $custom, $links );
	}
	return $links;
}
add_filter( 'plugin_row_meta', 'gtmt_plugin_action_links', 10, 2 );

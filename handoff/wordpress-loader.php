<?php
/**
 * PASSAGE AMADOR — carga de estilos y scripts del landing en WordPress.
 * Copiar en functions.php del child theme (Hello Elementor Child recomendado)
 * o en un plugin mínimo. Alternativa sin código: Elementor Pro → Site Settings →
 * Custom Code (ver HANDOFF.md §4).
 *
 * Coloca los archivos en el child theme:
 *   /passage/styles.css      (hoja consolidada del entregable)
 *   /passage/main.js         (interacciones)
 *   /passage/img/…           (activos; o súbelos a la Media Library y actualiza rutas)
 */

add_action( 'wp_enqueue_scripts', function () {
	// Sólo en la landing (ajustar el ID/slug de la página ES y EN).
	if ( ! is_page( array( 'passage-amador', 'passage-amador-en' ) ) ) {
		return;
	}
	$base = get_stylesheet_directory_uri() . '/passage/';
	$ver  = '2026-09-18';

	// Inter Tight 300/400/500 (misma fuente que Elementor puede cargar como Global Font;
	// si se configura en Elementor, omitir estas dos líneas).
	wp_enqueue_style( 'passage-font', 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500&display=swap', array(), null );

	// Hoja consolidada. Se carga DESPUÉS de Elementor para que sus reglas prevalezcan.
	wp_enqueue_style( 'passage', $base . 'styles.css', array( 'elementor-frontend' ), $ver );

	// Interacciones. Vanilla JS, sin dependencias; 'defer' porque consulta el DOM al cargar.
	wp_enqueue_script( 'passage', $base . 'main.js', array(), $ver, array( 'in_footer' => true, 'strategy' => 'defer' ) );
}, 20 );

/**
 * Elementor añade su propio kit de colores/fuentes. Para que no compita con los tokens
 * de styles.css: Elementor → Settings → General → marcar "Disable Default Colors" y
 * "Disable Default Fonts". Esto no se puede hacer desde código de forma fiable.
 */

/**
 * Permitir subir SVG (favicon.svg, ornamentos) en la Media Library.
 * Si se usa un plugin como "SVG Support" o "Safe SVG", omitir.
 */
add_filter( 'upload_mimes', function ( $mimes ) {
	$mimes['svg'] = 'image/svg+xml';
	return $mimes;
} );

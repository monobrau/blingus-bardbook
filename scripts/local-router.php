<?php
/**
 * Router for PHP's built-in server (local mode).
 * Usage: php -S 127.0.0.1:8765 -t . scripts/local-router.php
 */

$root = dirname(__DIR__);
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$file = $root . $uri;

if ($uri !== '/' && $uri !== '' && is_file($file)) {
    return false; // serve static / existing PHP as-is
}

require $root . '/index.php';

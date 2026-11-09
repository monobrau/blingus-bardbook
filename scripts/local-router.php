<?php
/**
 * Router for PHP's built-in server (local mode).
 * Usage: php -S 127.0.0.1:8765 -t . scripts/local-router.php
 */

$root = dirname(__DIR__);
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/');
$file = $root . $uri;

$hidden = basename($file);
if (in_array($hidden, ['.anthropic_key', '.elevenlabs_key', '.elevenlabs_voice', '.elevenlabs_sfx_key'], true)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Not found';
    return true;
}

if ($uri !== '/' && $uri !== '' && is_file($file)) {
    return false; // serve static / existing PHP as-is
}

require $root . '/index.php';

<?php
/**
 * Auto-versioning based on file modification times
 * Returns version numbers for cache-busting
 */

header('Content-Type: application/json');

$baseDir = __DIR__;
$scriptJs = $baseDir . '/script.js';
$stylesCss = $baseDir . '/styles.css';

$versions = [
    'script' => file_exists($scriptJs) ? filemtime($scriptJs) : time(),
    'styles' => file_exists($stylesCss) ? filemtime($stylesCss) : time(),
];

echo json_encode($versions);

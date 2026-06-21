<?php
/**
 * Blingus Bardbook Server-Side Data Storage API
 * 
 * Simple JSON file-based storage for user data.
 * Automatically used when running on a web server.
 * 
 * SECURITY: Configure authentication via environment variable or config file
 */

// Configuration - Set API key via environment variable or uncomment and set below
// For production, use environment variables or a secure config file outside web root
$API_KEY = getenv('BLINGUS_API_KEY') ?: '';
// Uncomment and set if not using environment variable:
// $API_KEY = 'your-secret-api-key-here';

// If API key is set, require authentication
$requireAuth = !empty($API_KEY);

// Set headers first
header('Content-Type: application/json');

// CORS configuration - restrict to your domain in production
$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://blingus.knospe.org',
    'http://blingus.knospe.org',
    'https://bardbook.knospe.org',
    'http://bardbook.knospe.org',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins) || empty($allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
} else {
    header('Access-Control-Allow-Origin: ' . ($allowedOrigins[0] ?? '*'));
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Authentication check
if ($requireAuth) {
    $providedKey = $_GET['key'] ?? $_POST['key'] ?? '';
    // Also check Authorization header
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $providedKey = $matches[1];
    }
    
    if (empty($providedKey) || $providedKey !== $API_KEY) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Unauthorized: Invalid or missing API key'
        ]);
        exit;
    }
}

// Log request details for debugging (without sensitive data)
error_log('Blingus API: Request method = ' . $_SERVER['REQUEST_METHOD']);
error_log('Blingus API: Request URI = ' . ($_SERVER['REQUEST_URI'] ?? 'unknown'));
// Don't log query string or POST/GET data as they may contain sensitive information

// Configuration
// Use realpath to resolve the absolute path properly
$baseDir = realpath(__DIR__ . '/..') ?: dirname(__DIR__);
$dataDir = $baseDir . '/data/';
$dataFile = $dataDir . 'blingus-data.json';

// Get absolute paths for better error messages and reliability
$absoluteDataDir = realpath($dataDir) ?: $dataDir;
// Ensure we have a trailing slash
if (substr($absoluteDataDir, -1) !== '/') {
    $absoluteDataDir .= '/';
}
$absoluteDataFile = $absoluteDataDir . 'blingus-data.json';

// Log the paths for debugging
error_log('Blingus API: Base directory: ' . $baseDir);
error_log('Blingus API: Data directory: ' . $absoluteDataDir);
error_log('Blingus API: Data file: ' . $absoluteDataFile);

// Ensure data directory exists
if (!is_dir($absoluteDataDir)) {
    if (!mkdir($absoluteDataDir, 0755, true)) {
        error_log('Blingus API: Failed to create data directory: ' . $absoluteDataDir);
    } else {
        error_log('Blingus API: Created data directory: ' . $absoluteDataDir);
    }
}

// Get action from query string, POST data, or JSON body
$action = $_GET['action'] ?? $_POST['action'] ?? '';

// If no action and it's a POST request, try to parse JSON body
if (empty($action) && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    // Only log input length, not content (may contain sensitive data)
    error_log('Blingus API: Raw input length = ' . strlen($input));
    $request = json_decode($input, true);
    if ($request && isset($request['action'])) {
        $action = $request['action'];
        error_log('Blingus API: Parsed action from JSON = ' . $action);
    }
}

error_log('Blingus API: Final action = ' . $action);

// Don't reject here - let the switch handle it
// The 405 might be coming from web server, not PHP

try {
    switch ($action) {
        case 'save':
            // Verify it's a POST request
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception('POST method required for save action');
            }
            
            // Save data to JSON file
            $input = file_get_contents('php://input');
            error_log('Blingus API: Raw input length = ' . strlen($input));
            
            if (empty($input)) {
                throw new Exception('Empty request body');
            }
            
            $request = json_decode($input, true);
            
            if ($request === null) {
                $jsonError = json_last_error_msg();
                error_log('Blingus API: JSON decode error = ' . $jsonError);
                throw new Exception('Invalid JSON format: ' . $jsonError);
            }
            
            if (!isset($request['data'])) {
                // Don't log request keys as they may contain sensitive data
                error_log('Blingus API: Missing data field in request');
                throw new Exception('Invalid data format: missing "data" field');
            }
            
            // Validate data structure
            $data = $request['data'];
            if (!is_array($data)) {
                throw new Exception('Invalid data format: data must be an object');
            }
            
            // Validate data size (prevent DoS)
            $jsonSize = strlen(json_encode($data));
            $maxSize = 10 * 1024 * 1024; // 10MB limit
            if ($jsonSize > $maxSize) {
                throw new Exception('Data too large: maximum size is ' . ($maxSize / 1024 / 1024) . 'MB');
            }
            
            // Get absolute path for better error messages
            $absoluteDataDir = realpath($dataDir) ?: $dataDir;
            // Ensure we have a trailing slash
            if (substr($absoluteDataDir, -1) !== DIRECTORY_SEPARATOR) {
                $absoluteDataDir .= DIRECTORY_SEPARATOR;
            }
            $absoluteDataFile = $absoluteDataDir . 'blingus-data.json';
            
            // Validate data directory is writable
            if (!is_writable($absoluteDataDir) && !is_writable(dirname($absoluteDataDir))) {
                error_log('Blingus API: Data directory not writable. Path: ' . $absoluteDataDir);
                // Don't log current user as it may be sensitive
                if (is_dir($absoluteDataDir)) {
                    error_log('Blingus API: Directory permissions: ' . substr(sprintf('%o', fileperms($absoluteDataDir)), -4));
                }
                throw new Exception('Data directory is not writable');
            }
            
            $data['serverTimestamp'] = date('c');
            
            // Write to file
            $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
            if ($json === false) {
                $jsonError = json_last_error_msg();
                throw new Exception('Failed to encode data as JSON: ' . $jsonError);
            }
            
            $result = @file_put_contents($absoluteDataFile, $json);
            if ($result === false) {
                $error = error_get_last();
                throw new Exception('Failed to write data file: ' . ($error ? $error['message'] : 'Unknown error') . ' (Path: ' . $absoluteDataFile . ')');
            }
            
            error_log('Blingus API: Successfully saved ' . strlen($json) . ' bytes to ' . $absoluteDataFile);
            
            echo json_encode([
                'success' => true,
                'message' => 'Data saved successfully',
                'timestamp' => $data['serverTimestamp']
            ]);
            break;
            
        case 'load':
            // Load data from JSON file
            if (!file_exists($absoluteDataFile)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No saved data found'
                ]);
                break;
            }
            
            $json = file_get_contents($absoluteDataFile);
            $data = json_decode($json, true);
            
            if ($data === null) {
                throw new Exception('Invalid JSON in data file');
            }
            
            echo json_encode([
                'success' => true,
                'data' => $data,
                'timestamp' => $data['serverTimestamp'] ?? $data['timestamp'] ?? null
            ]);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>


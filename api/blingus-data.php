<?php
/**
 * Blingus Bardbook Server-Side Data Storage API
 * 
 * Simple JSON file-based storage for user data.
 * Automatically used when running on a web server.
 * 
 * SECURITY: For production use, add authentication!
 */

// Set headers first
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log request details for debugging
error_log('Blingus API: Request method = ' . $_SERVER['REQUEST_METHOD']);
error_log('Blingus API: Request URI = ' . $_SERVER['REQUEST_URI']);
error_log('Blingus API: Query string = ' . ($_SERVER['QUERY_STRING'] ?? 'none'));
error_log('Blingus API: Content-Type = ' . ($_SERVER['CONTENT_TYPE'] ?? 'none'));
error_log('Blingus API: POST data = ' . print_r($_POST, true));
error_log('Blingus API: GET data = ' . print_r($_GET, true));

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
    error_log('Blingus API: Raw input = ' . substr($input, 0, 200));
    $request = json_decode($input, true);
    if ($request && isset($request['action'])) {
        $action = $request['action'];
        error_log('Blingus API: Parsed action from JSON = ' . $action);
    }
}

error_log('Blingus API: Final action = ' . $action);
error_log('Blingus API: Request method = ' . $_SERVER['REQUEST_METHOD']);

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
                error_log('Blingus API: Missing data field. Request keys: ' . implode(', ', array_keys($request)));
                throw new Exception('Invalid data format: missing "data" field');
            }
            
            $data = $request['data'];
            
            // Get absolute path for better error messages
            $absoluteDataDir = realpath($dataDir) ?: $dataDir;
            $absoluteDataFile = $absoluteDataDir . '/blingus-data.json';
            
            // Validate data directory is writable
            if (!is_writable($absoluteDataDir) && !is_writable(dirname($absoluteDataDir))) {
                error_log('Blingus API: Data directory not writable. Path: ' . $absoluteDataDir);
                error_log('Blingus API: Current user: ' . get_current_user());
                if (is_dir($absoluteDataDir)) {
                    error_log('Blingus API: Directory permissions: ' . substr(sprintf('%o', fileperms($absoluteDataDir)), -4));
                }
                throw new Exception('Data directory is not writable: ' . $absoluteDataDir . ' (Current user: ' . get_current_user() . ')');
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
            if (!file_exists($dataFile)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No saved data found'
                ]);
                break;
            }
            
            $json = file_get_contents($dataFile);
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


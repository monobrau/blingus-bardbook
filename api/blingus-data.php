<?php
/**
 * Blingus Bardbook Server-Side Data Storage API
 * 
 * Simple JSON file-based storage for user data.
 * Automatically used when running on a web server.
 * 
 * SECURITY: For production use, add authentication!
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configuration
$dataDir = __DIR__ . '/../data/';
$dataFile = $dataDir . 'blingus-data.json';

// Ensure data directory exists
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Get action from query string or POST data
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        case 'save':
            // Save data to JSON file
            $input = file_get_contents('php://input');
            $request = json_decode($input, true);
            
            if (!$request || !isset($request['data'])) {
                throw new Exception('Invalid data format');
            }
            
            $data = $request['data'];
            $data['serverTimestamp'] = date('c');
            
            // Write to file
            $json = json_encode($data, JSON_PRETTY_PRINT);
            if (file_put_contents($dataFile, $json) === false) {
                throw new Exception('Failed to write data file');
            }
            
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


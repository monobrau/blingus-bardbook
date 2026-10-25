# Cloud Sync Setup

This directory contains the server-side API for syncing Blingus Bardbook data across browsers and devices.

## Setup Instructions

1. **Ensure PHP SQLite extension is enabled:**
   ```bash
   # Check if SQLite is available
   php -m | grep sqlite
   # If not installed, install it:
   # Ubuntu/Debian: sudo apt-get install php-sqlite3
   # Fedora/RHEL: sudo dnf install php-pdo_sqlite
   ```

2. **Copy the PHP file to your web server:**
   ```bash
   # On your web server
   cd /var/www/html
   mkdir -p api
   cp api/blingus-sync.php /var/www/html/api/
   ```

3. **Create the data directory:**
   ```bash
   mkdir -p /var/www/html/data
   chmod 755 /var/www/html/data
   ```

4. **Set proper permissions:**
   ```bash
   # Make sure the web server can write to the data directory
   chown -R www-data:www-data /var/www/html/data
   # Or if using nginx:
   chown -R nginx:nginx /var/www/html/data
   ```

5. **Test the API:**
   ```bash
   curl -X POST http://blingus.knospe.org/api/blingus-sync.php \
     -H "Content-Type: application/json" \
     -d '{"action":"save","data":{"test":"data"}}'
   ```

## Security Notes

⚠️ **IMPORTANT:** The current implementation does NOT include authentication. Anyone who knows the URL can read/write data.

### For Production Use:

1. **Add Authentication:**
   - Add session-based authentication
   - Or use API keys/tokens
   - Or restrict by IP address
   - Or use your Authentik setup to protect the `/api/` directory

2. **Example with Simple API Key:**
   ```php
   // At the top of blingus-sync.php
   $API_KEY = 'your-secret-key-here';
   
   $providedKey = $_GET['key'] ?? $_POST['key'] ?? '';
   if ($providedKey !== $API_KEY) {
       http_response_code(401);
       echo json_encode(['success' => false, 'error' => 'Unauthorized']);
       exit;
   }
   ```

3. **Protect with Authentik (recommended):**
   - Configure Authentik to protect `/api/blingus-sync.php`
   - The app will automatically use authenticated requests

## How It Works

- **Save:** POSTs user data to `/api/blingus-sync.php?action=save`
- **Load:** GETs user data from `/api/blingus-sync.php?action=load`
- **Storage:** Data is saved in SQLite database `/data/blingus-sync.db`
- **Database:** Uses SQLite with a `user_data` table storing key-value pairs

## Usage

Once set up, users can:
1. Click the "☁️ Sync" button to manually sync
2. Data automatically loads from server on page load
3. Optional: Enable auto-sync in localStorage: `localStorage.setItem('blingusAutoSync', 'true')`


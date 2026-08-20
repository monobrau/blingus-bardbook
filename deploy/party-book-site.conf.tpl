# {{SERVER_NAME}} — {{APP_TITLE}}
# Backend: 127.0.0.1:{{BACKEND_PORT}}  |  oauth2-proxy: 127.0.0.1:{{PROXY_PORT}}
# Same engine as Blingus (/var/www/html). Branding is host-locked in index.php.

server {
    listen 127.0.0.1:{{BACKEND_PORT}};
    listen [::1]:{{BACKEND_PORT}};

    server_name {{SERVER_NAME}};

    root /var/www/html;
    index index.php index.html index.htm;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml;

    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 900;
        fastcgi_send_timeout 900;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        try_files $uri $uri/ =404;
    }
}

server {
    listen 127.0.0.1:80;
    listen [::1]:80;

    server_name {{SERVER_NAME}};

    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    large_client_header_buffers 4 32k;

    location = /favicon.ico {
        proxy_pass http://127.0.0.1:{{BACKEND_PORT}};
        proxy_set_header Host $host;
    }
    location = /favicon.svg {
        proxy_pass http://127.0.0.1:{{BACKEND_PORT}};
        proxy_set_header Host $host;
    }
    location = /apple-touch-icon.png {
        proxy_pass http://127.0.0.1:{{BACKEND_PORT}};
        proxy_set_header Host $host;
    }
    location = /apple-touch-icon-precomposed.png {
        proxy_pass http://127.0.0.1:{{BACKEND_PORT}}/apple-touch-icon.png;
        proxy_set_header Host $host;
    }

    location /oauth2/ {
        proxy_pass http://127.0.0.1:{{PROXY_PORT}};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header X-Auth-Request-Redirect $request_uri;
    }

    location = /oauth2/auth {
        proxy_pass http://127.0.0.1:{{PROXY_PORT}};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header Content-Length "";
        proxy_pass_request_body off;
    }

    location / {
        auth_request /oauth2/auth;
        error_page 401 = /oauth2/sign_in;

        auth_request_set $user $upstream_http_x_auth_request_user;
        auth_request_set $email $upstream_http_x_auth_request_email;
        proxy_set_header X-User $user;
        proxy_set_header X-Email $email;

        proxy_pass http://127.0.0.1:{{BACKEND_PORT}};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

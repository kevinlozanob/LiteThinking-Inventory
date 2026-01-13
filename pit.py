server {
    listen 80;
    server_name litethinking.nicklcs.dev;

    access_log /var/log/nginx/litethinking_access.log;
    error_log /var/log/nginx/litethinking_error.log;

    root /var/www/litethinking/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/var/www/litethinking/backend/litethinking.sock;
    }

    # 3. ADMIN DJANGO
    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/var/www/litethinking/backend/litethinking.sock;
    }

    # 4. ESTÁTICOS (CSS Admin)
    location /static/ {
        # Esta ruta depende de dónde se creó la carpeta staticfiles en el paso 1
        alias /var/www/litethinking/backend/backend/staticfiles/;
    }
}
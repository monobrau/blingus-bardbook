FROM php:8.3-apache-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/www/html/data/karaoke \
    && chown -R www-data:www-data /var/www/html/data

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html \
    && a2enmod rewrite headers \
    && sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf \
    && echo 'DirectoryIndex index.php index.html' >> /etc/apache2/apache2.conf

RUN echo "max_execution_time = 900" > /usr/local/etc/php/conf.d/bardbook.ini \
    && echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/bardbook.ini

ENV BLINGUS_API_KEY=""
ENV YTDLP_PATH=/usr/local/bin/yt-dlp

EXPOSE 80

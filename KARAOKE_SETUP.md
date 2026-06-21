# Karaoke Setup (Local YouTube Download + Playback)

The revamp branch downloads karaoke tracks to your homelab server and plays them locally in the browser — no YouTube iframe embed required.

## Requirements

- **PHP 8.x** with `proc_open` enabled (not disabled in `disable_functions`)
- **yt-dlp** — [https://github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp)
- **ffmpeg** — required by yt-dlp for merging streams

### Install on Ubuntu (blingus host)

```bash
sudo apt update
sudo apt install -y ffmpeg python3-pip
sudo pip3 install -U yt-dlp
# or: sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp

yt-dlp --version
```

### Environment variables (optional)

| Variable | Default | Purpose |
|----------|---------|---------|
| `BLINGUS_API_KEY` | (none) | Same key as `api/blingus-data.php` |
| `YTDLP_PATH` | `yt-dlp` | Path to yt-dlp binary |
| `FFMPEG_PATH` | `ffmpeg` | Path to ffmpeg |

## Storage

Downloaded files are saved to:

```
data/karaoke/{videoId}.mp4
```

This directory is gitignored. Ensure the web server user can write to `data/karaoke/`.

```bash
mkdir -p data/karaoke
chown -R www-data:www-data data/
chmod -R 755 data/
```

## API endpoints

Base: `/api/karaoke.php`

| Action | Method | Params | Description |
|--------|--------|--------|-------------|
| `ping` | GET | — | Check if yt-dlp is available |
| `search` | GET | `song`, `artist` or `q` | Search YouTube for karaoke videos |
| `download` | POST | `{ "videoId": "..." }` | Download video to server |
| `exists` | GET | `id` | Check if video is already downloaded |
| `stream` | GET | `id` | Stream video with Range support |

If `BLINGUS_API_KEY` is set, pass `Authorization: Bearer YOUR_KEY` or `?key=YOUR_KEY` on requests (including stream URLs).

## Nginx timeouts

Karaoke downloads can take several minutes. Increase timeouts for `/api/`:

```nginx
location /api/ {
    fastcgi_read_timeout 900;
    fastcgi_send_timeout 900;
    # ... existing php block ...
}
```

See [NGINX_CONFIG.md](NGINX_CONFIG.md) for the full site block.

## Docker

Use the included `docker-compose.yml` for a reproducible stack with yt-dlp preinstalled.

## Legal / usage

- For **personal homelab use** at your table only
- Do not redistribute downloaded videos
- Respect copyright and YouTube Terms of Service
- You select each video manually — no automatic bulk downloading

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "yt-dlp is not installed" | Install yt-dlp; set `YTDLP_PATH` if nonstandard |
| Download timeout | Increase PHP `max_execution_time` and nginx `fastcgi_read_timeout` |
| 401 on stream | Add API key to stream URL or disable auth for homelab LAN |
| Video not found after download | Check `data/karaoke/` permissions and disk space |

Test ping:

```bash
curl "https://blingus.knospe.org/api/karaoke.php?action=ping"
```

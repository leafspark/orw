## TLS/HTTPS frontend

It is strongly recommended to use an HTTPS proxy like [Caddy](https://caddyserver.com/) for serving `orw` on a public host. Some RSS feed readers may require HTTPS for communication. Setting up a reverse proxy with `Caddy` using a Caddyfile is [extremely simple](https://caddyserver.com/docs/caddyfile/patterns#reverse-proxy). Apart from setting up your DNS record, `Caddy` will then take care of getting TLS certificates and serving HTTPS to the outside world.

## How to install the OpenRouter API Watcher as a systemd user service on Arch Linux

1. As `superuser`, create a fresh user (e.g., `orw`):

```shell
sudo useradd -m orw
```

2. Enable lingering for the `orw` user so that the service will keep running when the `orw` user logs out:

```shell
sudo loginctl enable-linger orw
```

3. Switch to the `orw` user, install `orw` with git, and change to the cloned repository:

```shell
sudo -i -u orw
git clone https://github.com/fry69/orw
cd orw
```

4. Create a production environment file and edit it (make sure `ORW_PORT` and `ORW_URL` match reverse proxy settings):

```shell
cp .env.example .env.production
nano .env.production
```

5. (Optional) Download a seed database from `orw.karleo.net`:

```shell
curl -o orw.db.gz https://orw.karleo.net/orw.db.gz
gzip -d orw.db.gz
mv orw.db data/orw.db
```

6. Install the systemd service:

```shell
sh ./tools/install_service.sh
```

7. After successful installation, start the service and check the status (the service will automatically install/update `bun`, install/update modules, and build the web client):

```shell
systemctl --user start orw
systemctl --user status orw
```

8. (Optional) Check the log file and the systemd journal later:

```shell
tail orw.log
journalctl --user -u orw -f
```

9. (Optional) Update the `orw` repository at a later time and restart the watcher:

```shell
cd ~/orw
git pull --rebase
systemctl --user restart orw
journalctl --user -u orw -f
```

### Additional Notes for Arch Linux

- Ensure you have `git` and `curl` installed. You can install them using:

```shell
sudo pacman -S git curl
```

- If `vim` or `nano` is not installed, you can install them with:

```shell
sudo pacman -S vim nano
```

- Make sure `systemd` is set up and running properly. Arch Linux uses `systemd` by default, so you should be good to go.

#!/usr/bin/env bash

systemctl="systemctl --user --quiet"
service_dir="$HOME/.config/systemd/user/"

mkdir -p "$service_dir"

cp "./tools/orw.service" "$service_dir"

# Check if systemd --user is running, and if not, provide instructions to start it
if ! pgrep -u "$USER" -f "systemd --user" > /dev/null; then
    echo "It seems like systemd --user is not running."
    echo "Please ensure you are running this script within a proper user session."
    exit 1
fi

# Check if dbus is running, start if not
if [ -z "$DBUS_SESSION_BUS_ADDRESS" ]; then
    echo "Starting dbus..."
    eval $(dbus-launch --sh-syntax)
    export DBUS_SESSION_BUS_ADDRESS
fi

(
    $systemctl daemon-reload
    $systemctl enable orw
    $systemctl is-enabled orw.service
)

# shellcheck disable=SC2181
if [ $? -eq 0 ]; then
    echo "OpenRouter API Watcher service successfully installed and enabled."
    echo
    echo "Start the service with:"
    echo "systemctl --user start orw"
    echo
    echo "Check if the service is running with:"
    echo "systemctl --user status orw"
    echo
    echo "See the log for the service with:"
    echo "journalctl --user -u orw"
else
    echo "Service installation failed"
fi

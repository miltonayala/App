#!/usr/bin/env bash
# Interactive helper to build (and optionally run) the docker-lab app container.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Find docker, fall back to the Rancher Desktop path
if command -v docker >/dev/null 2>&1; then
  DOCKER="docker"
elif [ -x "/Users/miltonayala/.rd/bin/docker" ]; then
  DOCKER="/Users/miltonayala/.rd/bin/docker"
else
  echo "Error: docker is not installed or not on PATH." >&2
  exit 1
fi

# Make sure the daemon is running
if ! "$DOCKER" info >/dev/null 2>&1; then
  echo "Error: the Docker daemon is not running. Start Rancher Desktop and try again." >&2
  exit 1
fi

# ask <var> <prompt> <default> <regex> <error message>
# Re-prompts until the answer matches the regex.
ask() {
  local var="$1" prompt="$2" default="$3" regex="$4" err="$5" reply
  while true; do
    read -r -p "$prompt [$default]: " reply
    reply="${reply:-$default}"
    if [[ "$reply" =~ $regex ]]; then
      printf -v "$var" '%s' "$reply"
      return 0
    fi
    echo "  Invalid: $err" >&2
  done
}

ask IMAGE "Image name" "docker-lab-app" '^[a-z0-9._/-]+$' \
  "use lowercase letters, digits, '.', '_', '-' or '/'."
ask TAG "Tag" "latest" '^[A-Za-z0-9._-]+$' \
  "use letters, digits, '.', '_' or '-'."

# Build context must be a directory that holds a Dockerfile
while true; do
  read -r -p "Build context / Dockerfile path [$SCRIPT_DIR]: " CONTEXT
  CONTEXT="${CONTEXT:-$SCRIPT_DIR}"
  if [ -f "$CONTEXT/Dockerfile" ]; then break; fi
  echo "  Invalid: no Dockerfile found in '$CONTEXT'." >&2
done

# Port must be a number from 1 to 65535
while true; do
  ask PORT "Host port to publish (container port 3000)" "3000" '^[0-9]+$' \
    "port must be a number."
  if [ "$PORT" -ge 1 ] && [ "$PORT" -le 65535 ]; then break; fi
  echo "  Invalid: port must be between 1 and 65535." >&2
done

read -r -p "Run the container after building? [y/N]: " RUN_ANSWER
RUN_ANSWER="${RUN_ANSWER:-N}"
RUN_IT="no"
NAME=""
if [[ "$RUN_ANSWER" =~ ^[Yy]([Ee][Ss])?$ ]]; then
  RUN_IT="yes"
  ask NAME "Container name" "docker-lab-app-run" '^[A-Za-z0-9][A-Za-z0-9_.-]*$' \
    "use letters, digits, '_', '.' or '-'."
fi

# Summary and confirmation
echo
echo "Summary"
echo "  Image:    $IMAGE:$TAG"
echo "  Context:  $CONTEXT"
echo "  Port:     $PORT -> 3000"
echo "  Run:      $RUN_IT"
if [ "$RUN_IT" = "yes" ]; then echo "  Name:     $NAME"; fi
echo
read -r -p "Proceed with the build? [y/N]: " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]([Ee][Ss])?$ ]]; then
  echo "Cancelled."
  exit 0
fi

# Build (output streams to the terminal)
echo "Building $IMAGE:$TAG ..."
if ! "$DOCKER" build -t "$IMAGE:$TAG" "$CONTEXT"; then
  echo "Error: docker build failed." >&2
  exit 1
fi
echo "Build complete."

# Optionally run the container
if [ "$RUN_IT" = "yes" ]; then
  # Remove any existing container with the same name
  if [ -n "$("$DOCKER" ps -aq --filter "name=^${NAME}\$")" ]; then
    "$DOCKER" rm -f "$NAME" >/dev/null
  fi
  "$DOCKER" run -d --name "$NAME" -p "$PORT:3000" "$IMAGE:$TAG"
  echo "Container '$NAME' is running: http://localhost:$PORT"
fi

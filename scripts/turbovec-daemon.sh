#!/usr/bin/env bash
ROOT="/home/u188101251/production-app/shared/turbovec"
VENV="/home/u188101251/production-app/shared/venv-turbovec"
SCRIPT="/home/u188101251/production-app/shared/turbovec-service.py"
PID_FILE="$ROOT/turbovec.pid"
LOG_FILE="$ROOT/turbovec.log"
SOCK_FILE="$ROOT/turbovec.sock"

case "$1" in
  start)
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
      echo "TurboVec is already running (PID $(cat "$PID_FILE"))"
      exit 0
    fi
    echo "Starting TurboVec Daemon..."
    export RAYON_NUM_THREADS=1
    export OPENBLAS_NUM_THREADS=1
    export OMP_NUM_THREADS=1
    export MKL_NUM_THREADS=1
    export NUMEXPR_NUM_THREADS=1
    export VECLIB_MAXIMUM_THREADS=1
    export DGS_TURBOVEC_ROOT="$ROOT"
    rm -f "$SOCK_FILE"
    nohup "$VENV/bin/python" "$SCRIPT" --server --socket "$SOCK_FILE" > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    sleep 3
    if kill -0 $PID 2>/dev/null; then
      echo "TurboVec started successfully (PID $PID)"
      if [ -S "$SOCK_FILE" ]; then
        echo "Socket active: $SOCK_FILE"
      fi
    else
      echo "ERROR: TurboVec failed to start. Log output:"
      cat "$LOG_FILE"
      exit 1
    fi
    ;;
  stop)
    if [ -f "$PID_FILE" ]; then
      PID=$(cat "$PID_FILE")
      echo "Stopping TurboVec (PID $PID)..."
      kill $PID 2>/dev/null || true
      rm -f "$PID_FILE"
    fi
    pkill -f "turbovec-service.py" 2>/dev/null || true
    rm -f "$SOCK_FILE"
    echo "TurboVec stopped."
    ;;
  status)
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
      echo "TurboVec is running (PID $(cat "$PID_FILE"))"
      if [ -S "$SOCK_FILE" ]; then
        echo "Socket check:"
        curl -s --unix-socket "$SOCK_FILE" http://localhost/health || true
        echo ""
      fi
    else
      echo "TurboVec is NOT running"
      exit 1
    fi
    ;;
  restart)
    $0 stop
    sleep 1
    $0 start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac

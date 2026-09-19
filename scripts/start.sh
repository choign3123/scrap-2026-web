#!/usr/bin/env bash

# 명령 실패, 선언하지 않은 변수 사용, 파이프 중간 실패를 즉시 감지합니다.
set -Eeuo pipefail

# 실행 위치와 관계없이 프로젝트 루트를 정확히 찾습니다.
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

WEB_ROOT="${WEB_ROOT:-/var/www/scrap-web}"
ENV_FILE="${ENV_FILE:-${PROJECT_DIR}/.env.production.local}"
VITE_ENV_FILE="${PROJECT_DIR}/.env.production.local"
BUILD_DIR="${PROJECT_DIR}/dist"
NGINX_SITE_CONFIG="${NGINX_SITE_CONFIG:-/etc/nginx/sites-enabled/scrap-web}"
MIN_NODE_MAJOR=20
MIN_NODE_MINOR=19

log() {
  printf '\n[scrap-web] %s\n' "$1"
}

fail() {
  printf '\n[scrap-web] 오류: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "'$1' 명령을 찾을 수 없습니다. 서버에 먼저 설치해 주세요."
}

require_command node
require_command npm
require_command nginx
require_command sudo

# Vite가 요구하는 최소 Node.js 버전을 배포 전에 확인합니다.
NODE_VERSION="$(node --version | sed 's/^v//')"
NODE_MAJOR="${NODE_VERSION%%.*}"
NODE_REMAINDER="${NODE_VERSION#*.}"
NODE_MINOR="${NODE_REMAINDER%%.*}"

if (( NODE_MAJOR < MIN_NODE_MAJOR )) || \
  (( NODE_MAJOR == MIN_NODE_MAJOR && NODE_MINOR < MIN_NODE_MINOR )); then
  fail "Node.js ${MIN_NODE_MAJOR}.${MIN_NODE_MINOR} 이상이 필요합니다. 현재 버전: ${NODE_VERSION}"
fi

[[ -f "${ENV_FILE}" ]] || fail \
  "운영 환경변수 파일이 없습니다: ${ENV_FILE} (.env.production.example을 참고해 작성해 주세요.)"
[[ -e "${NGINX_SITE_CONFIG}" ]] || fail \
  "Nginx 사이트 설정이 활성화되지 않았습니다: ${NGINX_SITE_CONFIG} (배포 문서 4번을 먼저 진행해 주세요.)"

cd "${PROJECT_DIR}"

# 별도 ENV_FILE을 지정한 경우 Vite가 읽는 표준 위치에 잠시 복사했다가 원래 상태로 돌려놓습니다.
TEMP_ENV_BACKUP=""
restore_environment_file() {
  if [[ -n "${TEMP_ENV_BACKUP}" && -f "${TEMP_ENV_BACKUP}" ]]; then
    mv -f -- "${TEMP_ENV_BACKUP}" "${VITE_ENV_FILE}"
  elif [[ "${ENV_FILE}" != "${VITE_ENV_FILE}" ]]; then
    rm -f -- "${VITE_ENV_FILE}"
  fi
}
trap restore_environment_file EXIT

if [[ "${ENV_FILE}" != "${VITE_ENV_FILE}" ]]; then
  if [[ -f "${VITE_ENV_FILE}" ]]; then
    TEMP_ENV_BACKUP="$(mktemp)"
    cp -- "${VITE_ENV_FILE}" "${TEMP_ENV_BACKUP}"
  fi
  cp -- "${ENV_FILE}" "${VITE_ENV_FILE}"
fi

# API 주소가 빠진 상태로 빌드하면 브라우저에서 앱 자체가 시작되지 않으므로 미리 중단합니다.
grep -Eq '^[[:space:]]*VITE_API_BASE_URL=.+$' "${VITE_ENV_FILE}" || fail \
  "${ENV_FILE} 파일에 VITE_API_BASE_URL 값을 입력해 주세요."

log "package-lock.json 기준으로 의존성을 설치합니다."
npm ci

log "운영용 정적 파일을 빌드합니다."
npm run build

[[ -f "${BUILD_DIR}/index.html" ]] || fail "빌드 결과에서 dist/index.html을 찾지 못했습니다."

log "빌드 결과를 ${WEB_ROOT} 경로에 배포합니다."
sudo install -d -m 0755 "${WEB_ROOT}"
# 기존 디렉터리를 통째로 삭제하지 않고 새 빌드 결과만 안전하게 덮어씁니다.
sudo cp -a "${BUILD_DIR}/." "${WEB_ROOT}/"
sudo find "${WEB_ROOT}" -type d -exec chmod 0755 {} +
sudo find "${WEB_ROOT}" -type f -exec chmod 0644 {} +

log "Nginx 설정 문법을 확인합니다."
sudo nginx -t

if sudo systemctl is-active --quiet nginx; then
  log "실행 중인 Nginx에 새 설정과 파일을 반영합니다."
  sudo systemctl reload nginx
else
  log "Nginx를 시작하고 부팅 시 자동으로 실행되도록 설정합니다."
  sudo systemctl enable --now nginx
fi

log "배포가 완료되었습니다. http://서버-IP:3000 으로 접속해 화면과 API 호출을 확인해 주세요."

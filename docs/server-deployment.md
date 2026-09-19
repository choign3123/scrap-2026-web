# 스크랩 웹 서버 배포 및 기동 방법

이 문서는 **Ubuntu Linux 서버 + Nginx** 환경을 기준으로 스크랩 웹을 배포하는 방법을 설명합니다.

React/Vite 웹은 Spring Boot처럼 애플리케이션 프로세스를 계속 실행하는 구조가 아닙니다. 서버에서 먼저
HTML·JavaScript·CSS 정적 파일로 빌드한 뒤, Nginx가 그 파일을 사용자에게 전달합니다.

```text
사용자 브라우저
    ↓ HTTP 3000 포트
Nginx (3000 포트)
    ↓ 정적 파일 제공
/var/www/scrap-web
    ↓ 브라우저에서 API 요청
백엔드 API 서버
```

## 1. 서버 준비 사항

다음 프로그램이 필요합니다.

- Git
- Node.js 20.19 이상
- npm
- Nginx

설치 여부는 다음 명령으로 확인합니다.

```bash
git --version
node --version
npm --version
nginx -v
```

Node.js 14처럼 오래된 버전에서는 현재 Vite가 실행되지 않습니다. 이 프로젝트에서 사용하는 Node.js
버전 조건은 `package.json`의 `engines.node`에서 확인할 수 있습니다.

Ubuntu에서 Git과 Nginx를 설치하는 예시는 다음과 같습니다.

```bash
sudo apt update
sudo apt install -y git nginx
```

Node.js는 서버 운영 방침에 맞게 NodeSource 또는 nvm으로 설치합니다. 설치 후 `node --version`이
20.19 이상인지 반드시 확인합니다.

## 2. 프로젝트 내려받기

아래 경로는 예시이며 서버 환경에 맞게 변경해도 됩니다.

```bash
sudo mkdir -p /opt/scrap-2026-web
sudo chown -R "$USER":"$USER" /opt/scrap-2026-web
git clone <프론트엔드 Git 저장소 주소> /opt/scrap-2026-web
cd /opt/scrap-2026-web
```

Git을 사용하지 않는다면 프로젝트 파일을 `/opt/scrap-2026-web`에 직접 업로드해도 됩니다. 단,
`node_modules`와 `dist`는 서버로 복사하지 않고 서버에서 새로 생성하는 것을 권장합니다.

## 3. 운영 환경변수 작성

프로젝트 루트에서 예시 파일을 복사합니다.

```bash
cd /opt/scrap-2026-web
cp .env.production.example .env.production.local
vi .env.production.local
```

내용은 실제 API 서버 주소로 수정합니다.

```dotenv
VITE_API_BASE_URL=https://dev.teamscrap.co.kr
```

주의할 점은 다음과 같습니다.

- 주소 끝에 API 경로를 임의로 추가하지 않습니다. 프론트 API 서비스가 각 API 경로를 붙입니다.
- `VITE_`로 시작하는 값은 **빌드 시점에 JavaScript 파일 안에 포함**됩니다.
- 환경변수를 바꾼 뒤에는 쉘 스크립트를 다시 실행해 재빌드해야 합니다.
- `.env.production.local`은 Git에 커밋하지 않습니다.
- 프론트 주소가 바뀌면 백엔드 CORS 허용 Origin에도 해당 주소를 추가해야 합니다.

## 4. Nginx 설정 설치

프로젝트에 포함된 설정 파일을 Nginx 설정 디렉터리로 복사합니다.

```bash
sudo cp deploy/nginx/scrap-web.conf /etc/nginx/sites-available/scrap-web
sudo ln -sfn /etc/nginx/sites-available/scrap-web /etc/nginx/sites-enabled/scrap-web
```

`deploy/nginx/scrap-web.conf`에서 다음 값을 서버에 맞게 수정합니다.

```nginx
server_name _;
```

- IP로 먼저 테스트할 때는 `_`를 유지해도 됩니다.
- 실제 도메인을 연결했다면 `_` 대신 `scrap.example.com`처럼 작성합니다.

이 프로젝트는 기존 서비스가 사용하는 80, 443, 8080, 8090 포트를 피해서 기본적으로 **3000 포트**를
사용합니다.

```nginx
listen 3000;
listen [::]:3000;
```

다른 포트를 사용하고 싶다면 위 두 줄의 `3000`을 동일한 포트 번호로 변경합니다. 변경하기 전에는
해당 포트가 비어 있는지 확인합니다.

```bash
sudo ss -ltnp | grep ':3000'
```

아무 내용도 출력되지 않으면 일반적으로 3000 포트를 사용 중인 프로세스가 없다는 의미입니다. 이미
다른 프로세스가 표시되면 사용 가능한 다른 포트를 선택하고, 아래 접속 주소와 방화벽 규칙도 같은
포트로 변경해야 합니다.

설정 문법을 확인합니다.

```bash
sudo nginx -t
```

`syntax is ok`와 `test is successful`이 모두 출력되어야 합니다.

## 5. 기동 쉘 스크립트 실행

최초 한 번 실행 권한을 부여합니다.

```bash
cd /opt/scrap-2026-web
chmod +x scripts/start.sh
```

이후 다음 명령으로 빌드·배포·기동합니다.

```bash
./scripts/start.sh
```

실행 권한을 부여하지 않고 실행하려면 다음 명령도 가능합니다.

```bash
bash scripts/start.sh
```

스크립트가 수행하는 작업은 다음과 같습니다.

1. Node.js, npm, Nginx와 운영 환경변수 파일을 확인합니다.
2. `npm ci`로 `package-lock.json`에 고정된 의존성을 설치합니다.
3. `npm run build`로 TypeScript 검사와 Vite 운영 빌드를 실행합니다.
4. 생성된 `dist` 파일을 `/var/www/scrap-web`에 복사합니다.
5. `nginx -t`로 Nginx 설정을 검사합니다.
6. Nginx가 실행 중이면 reload하고, 중지 상태라면 시작합니다.

기본 배포 경로를 변경하려면 실행할 때 `WEB_ROOT`를 지정합니다. 이 경우 Nginx 설정의 `root`도 같은
경로로 수정해야 합니다.

```bash
WEB_ROOT=/srv/www/scrap-web ./scripts/start.sh
```

다른 환경변수 파일을 사용하려면 `ENV_FILE`을 지정합니다.

```bash
ENV_FILE=/etc/scrap-web/frontend.env ./scripts/start.sh
```

단, Vite가 자동으로 읽는 파일명이 아니므로 스크립트는 지정된 파일을 임시
`.env.production.local`로 복사하여 빌드하고 기존 파일을 복원합니다.

## 6. 기동 확인

서버 내부에서 다음 명령으로 HTTP 응답을 확인합니다.

```bash
curl -I http://127.0.0.1:3000
```

브라우저에서는 다음 주소에 접속합니다.

```text
http://서버-IP:3000
```

확인할 항목은 다음과 같습니다.

- 로그인 화면이 정상적으로 표시되는가
- 브라우저 개발자 도구 Console에 오류가 없는가
- 로그인 API 호출이 CORS 오류 없이 동작하는가
- `/scraps/123` 같은 상세 주소를 직접 새로고침해도 Nginx 404가 발생하지 않는가

## 7. 재배포 방법

새 코드를 받은 후 다시 스크립트만 실행하면 됩니다.

```bash
cd /opt/scrap-2026-web
git pull
./scripts/start.sh
```

스크립트는 기존 파일을 무조건 삭제하지 않고 새 빌드 결과를 덮어씁니다. Vite가 생성한 과거 해시
파일은 남을 수 있지만 서비스 동작에는 영향을 주지 않습니다. 디스크 정리가 필요할 때만 배포 경로를
확인한 후 오래된 파일을 별도로 정리합니다.

## 8. Nginx 운영 명령

```bash
# 현재 상태 확인
sudo systemctl status nginx

# 시작
sudo systemctl start nginx

# 중지
sudo systemctl stop nginx

# 설정을 다시 읽기
sudo systemctl reload nginx

# 부팅할 때 자동 시작
sudo systemctl enable nginx
```

## 9. 로그 확인과 문제 해결

Nginx 로그는 다음 명령으로 확인합니다.

```bash
sudo tail -f /var/log/nginx/scrap-web.access.log
sudo tail -f /var/log/nginx/scrap-web.error.log
```

### `VITE_API_BASE_URL 환경변수가 설정되지 않았습니다`

`.env.production.local` 파일이 존재하고 값이 비어 있지 않은지 확인한 후 스크립트를 다시 실행합니다.

### 상세 주소를 새로고침하면 404가 발생함

Nginx 설정에 다음 구문이 있는지 확인합니다. React Router가 처리할 주소를 `index.html`로 보내는
설정입니다.

```nginx
try_files $uri $uri/ /index.html;
```

### API 요청에서 CORS 오류가 발생함

프론트 코드 문제가 아니라 백엔드 CORS 설정에서 실제 프론트 Origin을 허용해야 합니다. HTTPS 웹에서
HTTP API를 호출하는 혼합 콘텐츠도 브라우저가 차단하므로 운영 환경에서는 웹과 API 모두 HTTPS를
사용하는 것이 좋습니다.

### 3000 포트에 접속할 수 없음

서버 방화벽과 클라우드 보안 그룹의 인바운드 규칙에서 TCP 3000 포트를 허용했는지 확인합니다.

```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

방화벽 변경은 서버 보안 정책을 확인한 뒤 진행합니다.

## 10. HTTPS 적용

현재 443 포트는 다른 서비스가 사용 중이므로 이 Nginx 설정에서는 HTTPS를 직접 열지 않습니다.
HTTPS가 필요하다면 443 포트를 사용 중인 기존 리버스 프록시에서 이 웹의 3000 포트로 전달하거나,
별도의 사용 가능한 TLS 포트를 정해야 합니다. 적용 방식은 현재 서버의 443 포트 구성과 도메인에 따라
달라지므로 설정을 변경하기 전에 기존 서비스 구성을 먼저 확인해야 합니다.

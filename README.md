# 모동숲 야생 수렵 도감

> 모여봐요 동물의 숲(북반구) 곤충 · 물고기 · 해산물 카탈로그
> Live: https://purisia.github.io/nooki/

## 주요 기능

- 페이지 진입 시 **현재 월 + 현재 시간** 으로 자동 필터
- 물고기 탭에서 **🐟 그림자 크기별 필터** (① 가장 작음 ~ ⑥ 가장 큼, 길쭉함)
  - 시드 데이터의 `N단계` 표기와 Nookipedia 동기화분의 영문(`Tiny`~`Huge`) 표기를 동일 카테고리로 정규화
- **🖼️ 실물 도감 이미지 · #도감번호 · ✨희귀도** 카드 표시 + 희귀도 필터
  - Nookipedia Cargo의 `image` / `number` / `rarity` 컬럼을 sync 시 신규·기존 종 모두에 보강(backfill)
- **🌸 꽃 교배** 탭 — 가진 색을 체크하면 없는 색의 가장 빠른 교배 경로 안내(유전자형 기반, 보유 색은 로그인 시 기기 간 동기화)
- **🏝️ 마일섬 / 🪑 기능성 가구 / 🔗 관련 링크** 탭
- **🏛️ 미기증만 보기** 토글로 앞으로 잡을 종만 추리기
- 박물관 기증 체크 영속화:
  - 비로그인 → 브라우저 쿠키 (1년 유지)
  - Google 로그인 → Firestore에 적재, 다기기 동기화
- 매일 KST 03:00 [Nookipedia](https://nookipedia.com) Cargo API에서 누락 종 자동 PR

## 로컬 개발

```bash
npm install
npm run dev
# http://localhost:5173/nooki/
```

Firebase 키가 없으면 로그인 UI는 "로컬 쿠키 모드" 뱃지로 비활성화되고, 쿠키만으로 동작합니다.
로그인 기능까지 켜려면 `.env.example`을 `.env.local`로 복사 후 6개 값을 입력합니다.

## 데이터 sync 수동 실행

```bash
node scripts/sync-critters.mjs
```

데이터 구조:
- `src/data/critters.json` — Nookipedia에서 받은 영문 canonical. sync가 매번 덮어쓰며 수동 편집 비권장.
- `src/data/overlay.json` — 손으로 관리하는 한국어 이름/메타(condition, rainOnly, desc, location 오버라이드). 영문명 → 한국어 매핑이 필요한 종을 추가합니다. sync는 절대 안 건드립니다.
- `src/data/location-map.json` — 영문 location → 한국어 location 일괄 번역 fallback.

새 종이 위키에 추가되면 sync가 영문 그대로 등재합니다. UI에 "⚠️ 영문명" 뱃지가 뜨므로 그 종의 영문명을 `overlay.json`에 추가해 한국어로 바꾸세요.

---

# 🔥 Firebase 설정 가이드 (한글)

Google 로그인 + 다기기 기증 데이터 동기화를 켜기 위한 단계입니다.
프로젝트가 이미 `nooki-33826`으로 생성되었다는 가정의 직접 링크를 함께 적어둡니다.

## 1. Firebase 프로젝트 생성

1. https://console.firebase.google.com 접속 → **프로젝트 추가**
2. 프로젝트 이름 입력 (예: `nooki`)
3. Google Analytics는 끄거나 켜거나 무방 — 이 앱은 분석 미사용

## 2. Google 로그인 (Authentication) 활성화

👉 직접 링크: `https://console.firebase.google.com/project/<프로젝트ID>/authentication/providers`

1. 사이드바 **Authentication** 클릭 (또는 "구축" 카테고리 안)
2. 처음이면 **시작하기** 버튼
3. **Sign-in method** 탭으로 이동
4. **추가 제공업체** 목록 → **Google** 클릭
5. 우상단 토글을 **사용 설정**으로 ON
6. **프로젝트 지원 이메일**: 본인 Gmail 선택 → **저장**

## 3. 승인된 도메인에 GitHub Pages 추가

👉 직접 링크: `https://console.firebase.google.com/project/<프로젝트ID>/authentication/settings`

1. Authentication → **Settings** 탭 → **승인된 도메인** 섹션
2. **도메인 추가** 클릭 → `purisia.github.io` 입력 (본인 GitHub 사용자명에 맞춰 변경)
3. 추가

> ⚠️ 이걸 빼먹으면 로그인 팝업이 `auth/unauthorized-domain` 에러로 차단됩니다.

## 4. Firestore Database 생성

👉 직접 링크: `https://console.firebase.google.com/project/<프로젝트ID>/firestore`

1. 사이드바 **Firestore Database** 클릭
2. **데이터베이스 만들기**
3. 위치: **`asia-northeast3 (서울)`** 권장 (지연 시간 최소)
4. **프로덕션 모드**로 시작 → **사용 설정**

## 5. Firestore 보안 규칙 적용

👉 직접 링크: `https://console.firebase.google.com/project/<프로젝트ID>/firestore/rules`

상단 **규칙** 탭에서 내용을 아래로 통째로 교체 후 우상단 **[게시]**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{collection}/{doc} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

이 규칙은 다음을 보장합니다:
- 로그인된 본인의 `users/{내UID}/...` 하위 문서(박물관 기증 `donations/state`, 꽃 보유 `flowers/state`)만 읽기/쓰기 가능
- 다른 사용자의 데이터는 절대 못 봄 / 못 씀
- 비로그인 상태에서는 어떤 접근도 거부됨

> ⚠️ 기본 프로덕션 규칙(`allow if false`)을 그대로 두면 토글 시 `permission-denied`로 저장 실패합니다.

## 6. 웹 앱 등록 + SDK 키 복사

👉 직접 링크: `https://console.firebase.google.com/project/<프로젝트ID>/settings/general`

1. 톱니바퀴(⚙) → **프로젝트 설정** → **일반** 탭
2. 스크롤 다운 → **내 앱** 섹션 → **`</>` 웹 아이콘** 클릭
3. 앱 닉네임: `nooki` (자유)
4. **Firebase Hosting 설정** 체크박스는 **언체크** (GitHub Pages 사용 중이므로)
5. **앱 등록**
6. 표시되는 `firebaseConfig`의 **6개 값**을 복사 (혹은 추후 "구성"에서 다시 확인 가능)

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "프로젝트ID.firebaseapp.com",
  projectId: "프로젝트ID",
  storageBucket: "프로젝트ID.firebasestorage.app",
  messagingSenderId: "숫자열",
  appId: "1:숫자:web:해시"
};
```

## 7. GitHub Secrets 등록

`gh` CLI가 있다면 한 번에:

```bash
gh secret set VITE_FIREBASE_API_KEY --body "AIza..."
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "프로젝트ID.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID --body "프로젝트ID"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "프로젝트ID.firebasestorage.app"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "숫자열"
gh secret set VITE_FIREBASE_APP_ID --body "1:숫자:web:해시"
```

또는 GitHub repo Settings → **Secrets and variables** → **Actions** → **New repository secret** 으로 위 6개를 동일한 이름으로 추가.

## 8. 재배포 트리거

빈 커밋을 푸시하면 Pages workflow가 새 환경변수로 빌드합니다:

```bash
git commit --allow-empty -m "chore: trigger redeploy with Firebase secrets"
git push
```

배포 후 https://purisia.github.io/nooki/ 새로고침 → 헤더의 **Google 로그인** 버튼이 활성화됩니다.

## 9. 저장된 데이터 확인

👉 직접 링크: `https://console.firebase.google.com/project/<프로젝트ID>/firestore/data`

```
users (컬렉션)
 └─ {본인 UID} (문서)
     └─ donations (서브컬렉션)
         └─ state (문서)
             └─ map: { "b1": true, "f12": true, ... }
```

내 UID 확인: `https://console.firebase.google.com/project/<프로젝트ID>/authentication/users`

---

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| 헤더에 "로컬 쿠키 모드" 뱃지 표시 | `VITE_FIREBASE_*` 환경변수가 빌드 시 주입 안 됨. GitHub Secrets 6개 모두 등록했는지 확인 후 재배포 |
| 로그인 팝업이 `auth/unauthorized-domain` 으로 차단 | 단계 3의 **승인된 도메인**에 `purisia.github.io` 추가 안 됨 |
| 로그인은 되는데 체크 시 `permission-denied` | 단계 5의 Firestore 규칙 미게시 / 잘못 게시됨 |
| 로그인 버튼 누르면 `auth/operation-not-allowed` | 단계 2의 Google 공급업체 사용 설정 OFF 상태 |
| Firestore 데이터 페이지가 비어있음 | 로그인 후 카드 하나도 토글 안 했거나, 규칙 미게시로 쓰기 실패. F12 → Console 탭의 빨간 에러 확인 |

---

## 데이터 출처

- 도감 데이터: [Nookipedia](https://nookipedia.com) (CC BY-SA 3.0)
- 한국어 명칭: [alexislours/ACNHAPI](https://github.com/alexislours/ACNHAPI) 의 인게임 KRko 로컬라이즈 + 한국닌텐도 공식 가이드 / 인게임 도감 매핑

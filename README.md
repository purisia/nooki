# 모동숲 야생 수렵 도감

> 모여봐요 동물의 숲(북반구) 곤충 · 물고기 · 해산물 카탈로그
> Live: https://purisia.github.io/nooki/

## 주요 기능

- 페이지 진입 시 **현재 월 + 현재 시간** 으로 자동 필터
- 박물관 기증 체크 영속화:
  - 비로그인 → 브라우저 쿠키 (1년 유지)
  - Google 로그인 → Firestore에 적재, 다기기 동기화
- 매일 KST 03:00 [Nookipedia](https://nookipedia.com)에서 누락 종 자동 PR

## 로컬 개발

```bash
npm install
npm run dev
# http://localhost:5173/nooki/
```

Firebase 키가 없으면 로그인 UI는 비활성화되고 쿠키 모드로만 동작합니다. 키를 채우려면 `.env.example`을 `.env.local`로 복사 후 6개 값 입력.

## 데이터 sync 수동 실행

```bash
node scripts/sync-critters.mjs
```

## Firebase 설정 가이드

1. https://console.firebase.google.com 에서 프로젝트 생성
2. **Authentication → Sign-in method → Google** 활성화
3. **Firestore Database** 생성 (Production 모드, 리전: `asia-northeast3` 권장)
4. Firestore 보안 규칙:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/donations/{doc} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
5. 프로젝트 설정 → 일반 → 내 앱(웹) → SDK 구성 6개 키 복사
6. GitHub repo의 Settings → Secrets and variables → Actions 에 6개 키를 모두 등록 (이름은 `.env.example` 참고)
7. Firebase Auth → Settings → **승인된 도메인**에 `purisia.github.io` 추가

## 데이터 출처

- 도감 데이터: [Nookipedia](https://nookipedia.com) (CC BY-SA 3.0)
- 한국어 명칭: 한국닌텐도 공식 가이드 / 인게임 도감 매핑

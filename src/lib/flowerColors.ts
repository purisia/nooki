import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, type User } from './firebase';

/**
 * 보유한 꽃 색 체크 상태 영속화. donations 와 동일한 패턴:
 *  - 비로그인 → 쿠키(1년)
 *  - 로그인 → Firestore (users/{uid}/donations/flowerColors), 최초 로그인 시 쿠키 병합
 *
 * 주의: 이미 배포된 보안 규칙이 `users/{uid}/donations/{doc}` 만 허용하므로,
 * 별도 폴더(flowers)가 아니라 donations 폴더 안의 문서(flowerColors)에 저장한다.
 * → 사용자가 Firestore 규칙을 새로 손대지 않아도 동작.
 * 키 형식: `${species}:${color}` → true
 */
const COOKIE_KEY = 'ac_flowers_v1';
const COOKIE_EXPIRES_DAYS = 365;

export type FlowerColorMap = Record<string, boolean>;

function readCookie(): FlowerColorMap {
  const raw = Cookies.get(COOKIE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeCookie(map: FlowerColorMap) {
  Cookies.set(COOKIE_KEY, JSON.stringify(map), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax',
  });
}

function clearCookie() {
  Cookies.remove(COOKIE_KEY);
}

export interface UseFlowerColorsResult {
  owned: FlowerColorMap;
  toggle: (key: string) => Promise<void>;
  has: (key: string) => boolean;
}

/**
 * 인증 상태(user)는 useDonations 와 공유하지 않고 인자로 받아 단일 소스를 유지.
 * App 에서 이미 구독 중인 user/authReady 를 그대로 넘긴다.
 */
export function useFlowerColors(
  user: User | null,
  authReady: boolean
): UseFlowerColorsResult {
  const [owned, setOwned] = useState<FlowerColorMap>(() => readCookie());
  const mergedForUidRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authReady) return;

    if (user && db) {
      const ref = doc(db, 'users', user.uid, 'donations', 'flowerColors');
      const unsub = onSnapshot(ref, async (snap) => {
        const remote: FlowerColorMap = snap.exists()
          ? ((snap.data() as { map?: FlowerColorMap }).map ?? {})
          : {};

        if (mergedForUidRef.current !== user.uid) {
          const local = readCookie();
          const localTrueKeys = Object.entries(local)
            .filter(([, v]) => v)
            .map(([k]) => k);

          if (localTrueKeys.length > 0) {
            const combined: FlowerColorMap = { ...remote };
            for (const k of localTrueKeys) combined[k] = true;
            const changed = JSON.stringify(combined) !== JSON.stringify(remote);
            if (changed) await setDoc(ref, { map: combined }, { merge: false });
            clearCookie();
            setOwned(combined);
          } else {
            setOwned(remote);
          }
          mergedForUidRef.current = user.uid;
        } else {
          setOwned(remote);
        }
      });
      return () => {
        unsub();
        mergedForUidRef.current = null;
      };
    } else {
      setOwned(readCookie());
    }
  }, [user, authReady]);

  const toggle = async (key: string) => {
    const next: FlowerColorMap = { ...owned };
    if (next[key]) delete next[key];
    else next[key] = true;
    setOwned(next);

    if (user && db) {
      const ref = doc(db, 'users', user.uid, 'donations', 'flowerColors');
      try {
        await setDoc(ref, { map: next }, { merge: false });
      } catch {
        // 서버 저장 실패(규칙/네트워크) 시에도 체크가 풀리지 않도록 쿠키로 폴백.
        writeCookie(next);
      }
    } else {
      writeCookie(next);
    }
  };

  const has = (key: string) => !!owned[key];

  return { owned, toggle, has };
}

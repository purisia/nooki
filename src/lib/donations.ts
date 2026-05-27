import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, firebaseEnabled, onAuthChange, type User } from './firebase';

const COOKIE_KEY = 'ac_donated_v3';
const COOKIE_EXPIRES_DAYS = 365;

export type DonationMap = Record<string, boolean>;

function readCookie(): DonationMap {
  const raw = Cookies.get(COOKIE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeCookie(map: DonationMap) {
  Cookies.set(COOKIE_KEY, JSON.stringify(map), {
    expires: COOKIE_EXPIRES_DAYS,
    sameSite: 'lax',
  });
}

function clearCookie() {
  Cookies.remove(COOKIE_KEY);
}

export interface UseDonationsResult {
  donated: DonationMap;
  toggle: (id: string) => Promise<void>;
  user: User | null;
  authReady: boolean;
}

export function useDonations(): UseDonationsResult {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!firebaseEnabled);
  const [donated, setDonated] = useState<DonationMap>(() => readCookie());
  const mergedForUidRef = useRef<string | null>(null);

  useEffect(() => {
    return onAuthChange((u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (user && db) {
      const ref = doc(db, 'users', user.uid, 'donations', 'state');
      const unsub = onSnapshot(ref, async (snap) => {
        const remote: DonationMap = snap.exists()
          ? ((snap.data() as { map?: DonationMap }).map ?? {})
          : {};

        if (mergedForUidRef.current !== user.uid) {
          const local = readCookie();
          const localTrueKeys = Object.entries(local)
            .filter(([, v]) => v)
            .map(([k]) => k);

          if (localTrueKeys.length > 0) {
            const combined: DonationMap = { ...remote };
            for (const k of localTrueKeys) combined[k] = true;
            const changed =
              JSON.stringify(combined) !== JSON.stringify(remote);
            if (changed) {
              await setDoc(ref, { map: combined }, { merge: false });
            }
            clearCookie();
            setDonated(combined);
          } else {
            setDonated(remote);
          }
          mergedForUidRef.current = user.uid;
        } else {
          setDonated(remote);
        }
      });
      return () => {
        unsub();
        mergedForUidRef.current = null;
      };
    } else {
      setDonated(readCookie());
    }
  }, [user, authReady]);

  const toggle = async (id: string) => {
    const next: DonationMap = { ...donated };
    if (next[id]) delete next[id];
    else next[id] = true;
    setDonated(next);

    if (user && db) {
      const ref = doc(db, 'users', user.uid, 'donations', 'state');
      await setDoc(ref, { map: next }, { merge: false });
    } else {
      writeCookie(next);
    }
  };

  return { donated, toggle, user, authReady };
}

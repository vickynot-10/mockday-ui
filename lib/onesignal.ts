declare global {
  interface Window {
    OneSignal: any[] | any; // becomes the real SDK object after init
    OneSignalDeferred?: any[];
  }
}

let initPromise: Promise<void> | null = null;

export function initOneSignal(appId: string) {
  if (!initPromise) {
    initPromise = new Promise<void>((resolve, reject) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          await OneSignal.init({ appId });
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    }).catch((err) => {
      initPromise = null; // allow retry
      throw err;
    });
  }
  return initPromise;
}

export function waitForOneSignal(appId?: string) {
  if (!initPromise) {
    if (!appId) throw new Error("OneSignal not initialized yet");
    return initOneSignal(appId);
  }
  return initPromise;
}
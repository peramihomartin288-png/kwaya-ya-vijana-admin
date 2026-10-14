import { useEffect } from 'react';

export default function InstallPWAHandler() {
  useEffect(() => {
    let deferred = null;

    function onBeforeInstall(e) {
      e.preventDefault();
      deferred = e;
    }

    function onTrigger() {
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.then(() => { deferred = null; });
      }
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('trigger-install', onTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('trigger-install', onTrigger);
    };
  }, []);

  return null;
}

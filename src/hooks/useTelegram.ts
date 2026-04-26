import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegram() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Notify Telegram that the app is ready is handled by the SDK usually, 
    // but we can ensure it's expanded to full height if needed.
    WebApp.ready();
    WebApp.expand();

    if (WebApp.initDataUnsafe?.user) {
      setUser(WebApp.initDataUnsafe.user);
    }
  }, []);

  const onClose = () => {
    WebApp.close();
  };

  const onToggleButton = () => {
    if (WebApp.MainButton.isVisible) {
      WebApp.MainButton.hide();
    } else {
      WebApp.MainButton.show();
    }
  };

  return {
    onClose,
    onToggleButton,
    tg: WebApp,
    user: WebApp.initDataUnsafe?.user,
    queryId: WebApp.initDataUnsafe?.query_id,
  };
}

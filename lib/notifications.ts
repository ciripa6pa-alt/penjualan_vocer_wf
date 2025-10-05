export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200]
    });
  }
};

export const notifyDataChange = (action: 'tambah' | 'edit' | 'hapus', type: 'penjualan' | 'catatan') => {
  const actionText = {
    tambah: 'Ditambahkan',
    edit: 'Diperbarui',
    hapus: 'Dihapus'
  };

  const typeText = {
    penjualan: 'Data Penjualan',
    catatan: 'Catatan'
  };

  showNotification(
    `${typeText[type]} ${actionText[action]}`,
    `${typeText[type]} berhasil ${actionText[action].toLowerCase()}`
  );
};

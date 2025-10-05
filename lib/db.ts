import localforage from 'localforage';

export interface Sale {
  id: string;
  tanggal: string;
  namaPelanggan: string;
  paket: '24 Jam' | '7 Hari' | '15 Hari' | '30 Hari';
  harga: number;
  kodeVoucher: string;
  feePenjual: number;
  setoranBersih: number;
}

export interface Note {
  id: string;
  tanggal: string;
  judul: string;
  isi: string;
}

export interface HistorySetoran {
  id: string;
  tanggal: string;
  totalPenjualan: number;
  totalFee: number;
  totalSetoran: number;
  jumlahTransaksi: number;
}

const salesDB = localforage.createInstance({
  name: 'voucherApp',
  storeName: 'sales'
});

const notesDB = localforage.createInstance({
  name: 'voucherApp',
  storeName: 'notes'
});

const historyDB = localforage.createInstance({
  name: 'voucherApp',
  storeName: 'history'
});

export const PAKET_CONFIG = {
  '24 Jam': { harga: 5000, fee: 1000 },
  '7 Hari': { harga: 20000, fee: 2000 },
  '15 Hari': { harga: 35000, fee: 5000 },
  '30 Hari': { harga: 60000, fee: 5000 }
};

export const db = {
  sales: {
    async getAll(): Promise<Sale[]> {
      const keys = await salesDB.keys();
      const sales = await Promise.all(
        keys.map(key => salesDB.getItem<Sale>(key))
      );
      return sales.filter(Boolean) as Sale[];
    },

    async get(id: string): Promise<Sale | null> {
      return await salesDB.getItem<Sale>(id);
    },

    async add(sale: Omit<Sale, 'id'>): Promise<Sale> {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newSale: Sale = { ...sale, id };
      await salesDB.setItem(id, newSale);
      return newSale;
    },

    async update(id: string, sale: Partial<Sale>): Promise<Sale | null> {
      const existing = await salesDB.getItem<Sale>(id);
      if (!existing) return null;
      const updated = { ...existing, ...sale };
      await salesDB.setItem(id, updated);
      return updated;
    },

    async delete(id: string): Promise<void> {
      await salesDB.removeItem(id);
    },

    async clear(): Promise<void> {
      await salesDB.clear();
    }
  },

  notes: {
    async getAll(): Promise<Note[]> {
      const keys = await notesDB.keys();
      const notes = await Promise.all(
        keys.map(key => notesDB.getItem<Note>(key))
      );
      return notes.filter(Boolean) as Note[];
    },

    async get(id: string): Promise<Note | null> {
      return await notesDB.getItem<Note>(id);
    },

    async add(note: Omit<Note, 'id'>): Promise<Note> {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newNote: Note = { ...note, id };
      await notesDB.setItem(id, newNote);
      return newNote;
    },

    async update(id: string, note: Partial<Note>): Promise<Note | null> {
      const existing = await notesDB.getItem<Note>(id);
      if (!existing) return null;
      const updated = { ...existing, ...note };
      await notesDB.setItem(id, updated);
      return updated;
    },

    async delete(id: string): Promise<void> {
      await notesDB.removeItem(id);
    }
  },

  history: {
    async getAll(): Promise<HistorySetoran[]> {
      const keys = await historyDB.keys();
      const history = await Promise.all(
        keys.map(key => historyDB.getItem<HistorySetoran>(key))
      );
      return (history.filter(Boolean) as HistorySetoran[]).sort((a, b) =>
        new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
      );
    },

    async add(history: Omit<HistorySetoran, 'id'>): Promise<HistorySetoran> {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newHistory: HistorySetoran = { ...history, id };
      await historyDB.setItem(id, newHistory);
      return newHistory;
    }
  }
};

'use client';

import { useState, useEffect } from 'react';
import { TopNav } from '@/components/top-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { db, Sale, PAKET_CONFIG } from '@/lib/db';
import { notifyDataChange, requestNotificationPermission } from '@/lib/notifications';
import { useToast } from '@/hooks/use-toast';

type PaketType = keyof typeof PAKET_CONFIG;

export default function Home() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    namaPelanggan: '',
    paket: '' as PaketType | '',
    kodeVoucher: ''
  });

  useEffect(() => {
    loadSales();
    requestNotificationPermission();
  }, []);

  const loadSales = async () => {
    const data = await db.sales.getAll();
    setSales(data.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));
  };

  const handlePaketChange = (paket: string) => {
    setFormData({ ...formData, paket: paket as PaketType });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paket) {
      toast({ title: 'Error', description: 'Pilih paket terlebih dahulu', variant: 'destructive' });
      return;
    }

    const config = PAKET_CONFIG[formData.paket];
    const saleData = {
      tanggal: formData.tanggal,
      namaPelanggan: formData.namaPelanggan,
      paket: formData.paket,
      harga: config.harga,
      kodeVoucher: formData.kodeVoucher,
      feePenjual: config.fee,
      setoranBersih: config.harga - config.fee
    };

    if (editingSale) {
      await db.sales.update(editingSale.id, saleData);
      notifyDataChange('edit', 'penjualan');
      toast({ title: 'Berhasil', description: 'Data penjualan berhasil diperbarui' });
    } else {
      await db.sales.add(saleData);
      notifyDataChange('tambah', 'penjualan');
      toast({ title: 'Berhasil', description: 'Data penjualan berhasil ditambahkan' });
    }

    resetForm();
    loadSales();
    setIsDialogOpen(false);
  };

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      tanggal: sale.tanggal,
      namaPelanggan: sale.namaPelanggan,
      paket: sale.paket,
      kodeVoucher: sale.kodeVoucher
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      await db.sales.delete(id);
      notifyDataChange('hapus', 'penjualan');
      toast({ title: 'Berhasil', description: 'Data penjualan berhasil dihapus' });
      loadSales();
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      namaPelanggan: '',
      paket: '',
      kodeVoucher: ''
    });
    setEditingSale(null);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <TopNav title="Penjualan Voucher WiFi" />
      <div className="p-4 space-y-4">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Tambah Penjualan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>{editingSale ? 'Edit Penjualan' : 'Tambah Penjualan'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="namaPelanggan">Nama Pelanggan</Label>
                <Input
                  id="namaPelanggan"
                  value={formData.namaPelanggan}
                  onChange={(e) => setFormData({ ...formData, namaPelanggan: e.target.value })}
                  required
                  placeholder="Masukkan nama pelanggan"
                />
              </div>

              <div>
                <Label htmlFor="paket">Paket</Label>
                <Select value={formData.paket} onValueChange={handlePaketChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih paket" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(PAKET_CONFIG).map((paket) => (
                      <SelectItem key={paket} value={paket}>
                        {paket} - {formatRupiah(PAKET_CONFIG[paket as PaketType].harga)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.paket && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Harga:</span>
                      <span className="font-semibold">{formatRupiah(PAKET_CONFIG[formData.paket].harga)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee Penjual:</span>
                      <span className="font-semibold">{formatRupiah(PAKET_CONFIG[formData.paket].fee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-blue-300 pt-1">
                      <span>Setoran Bersih:</span>
                      <span className="font-bold text-blue-700">
                        {formatRupiah(PAKET_CONFIG[formData.paket].harga - PAKET_CONFIG[formData.paket].fee)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div>
                <Label htmlFor="kodeVoucher">Kode Voucher</Label>
                <Input
                  id="kodeVoucher"
                  value={formData.kodeVoucher}
                  onChange={(e) => setFormData({ ...formData, kodeVoucher: e.target.value })}
                  required
                  placeholder="Masukkan kode voucher"
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingSale ? 'Update' : 'Simpan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {sales.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              Belum ada data penjualan. Klik tombol di atas untuk menambah.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <Card key={sale.id} className="overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{sale.namaPelanggan}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{new Date(sale.tanggal).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(sale)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(sale.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paket:</span>
                      <span className="font-semibold">{sale.paket}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harga:</span>
                      <span className="font-semibold">{formatRupiah(sale.harga)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee:</span>
                      <span className="font-semibold">{formatRupiah(sale.feePenjual)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Setoran Bersih:</span>
                      <span className="font-bold text-blue-700">{formatRupiah(sale.setoranBersih)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 pt-1">
                      <span>Kode Voucher:</span>
                      <span className="font-mono">{sale.kodeVoucher}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

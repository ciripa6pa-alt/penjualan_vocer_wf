'use client';

import { useState, useEffect } from 'react';
import { TopNav } from '@/components/top-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Wallet, FileSpreadsheet, CircleArrowUp as ArrowUpCircle } from 'lucide-react';
import { db, Sale } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export default function LaporanPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totals, setTotals] = useState({
    totalPenjualan: 0,
    totalFee: 0,
    totalSetoran: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await db.sales.getAll();
    setSales(data);

    const totalPenjualan = data.reduce((sum, sale) => sum + sale.harga, 0);
    const totalFee = data.reduce((sum, sale) => sum + sale.feePenjual, 0);
    const totalSetoran = data.reduce((sum, sale) => sum + sale.setoranBersih, 0);

    setTotals({ totalPenjualan, totalFee, totalSetoran });
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportToExcel = () => {
    const exportData = sales.map(sale => ({
      'Tanggal': new Date(sale.tanggal).toLocaleDateString('id-ID'),
      'Nama Pelanggan': sale.namaPelanggan,
      'Paket': sale.paket,
      'Harga': sale.harga,
      'Kode Voucher': sale.kodeVoucher,
      'Fee Penjual': sale.feePenjual,
      'Setoran Bersih': sale.setoranBersih
    }));

    exportData.push({
      'Tanggal': '',
      'Nama Pelanggan': '',
      'Paket': 'TOTAL' as any,
      'Harga': totals.totalPenjualan,
      'Kode Voucher': '',
      'Fee Penjual': totals.totalFee,
      'Setoran Bersih': totals.totalSetoran
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan');

    const fileName = `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: 'Berhasil',
      description: 'Laporan berhasil diekspor ke Excel'
    });
  };

  const handleSetor = async () => {
    if (sales.length === 0) {
      toast({
        title: 'Tidak Ada Data',
        description: 'Tidak ada data penjualan untuk disetor',
        variant: 'destructive'
      });
      return;
    }

    if (confirm(`Yakin ingin menyetor ${sales.length} transaksi dengan total setoran ${formatRupiah(totals.totalSetoran)}?`)) {
      await db.history.add({
        tanggal: new Date().toISOString(),
        totalPenjualan: totals.totalPenjualan,
        totalFee: totals.totalFee,
        totalSetoran: totals.totalSetoran,
        jumlahTransaksi: sales.length
      });

      await db.sales.clear();

      toast({
        title: 'Berhasil',
        description: 'Data penjualan telah disetor dan direset'
      });

      loadData();
    }
  };

  return (
    <>
      <TopNav title="Laporan Penjualan" />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Total Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatRupiah(totals.totalPenjualan)}</p>
              <p className="text-xs opacity-90 mt-1">{sales.length} transaksi</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Total Fee Penjual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatRupiah(totals.totalFee)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Total Setoran Bersih
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatRupiah(totals.totalSetoran)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="lg"
            disabled={sales.length === 0}
          >
            <FileSpreadsheet className="w-5 h-5 mr-2" />
            Export Excel
          </Button>

          <Button
            onClick={handleSetor}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
            disabled={sales.length === 0}
          >
            <ArrowUpCircle className="w-5 h-5 mr-2" />
            Setor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detail Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Belum ada data transaksi</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead className="text-right">Setoran</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="text-xs">
                          {new Date(sale.tanggal).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short'
                          })}
                        </TableCell>
                        <TableCell className="text-sm">{sale.namaPelanggan}</TableCell>
                        <TableCell className="text-xs">{sale.paket}</TableCell>
                        <TableCell className="text-right text-sm">{formatRupiah(sale.harga)}</TableCell>
                        <TableCell className="text-right text-sm">{formatRupiah(sale.feePenjual)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold text-blue-700">
                          {formatRupiah(sale.setoranBersih)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

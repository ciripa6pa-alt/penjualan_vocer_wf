'use client';

import { useState, useEffect } from 'react';
import { TopNav } from '@/components/top-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, Package } from 'lucide-react';
import { db, HistorySetoran } from '@/lib/db';

export default function RiwayatSetoranPage() {
  const [history, setHistory] = useState<HistorySetoran[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await db.history.getAll();
    setHistory(data);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return (
    <>
      <TopNav title="Riwayat Setoran" />
      <div className="p-4 space-y-4">
        {history.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Belum Ada Riwayat Setoran</p>
              <p className="text-sm mt-2">
                Riwayat setoran akan muncul setelah Anda melakukan setoran dari halaman Laporan
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => {
              const { date, time } = formatDateTime(item.tanggal);
              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Setoran #{history.length - index}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{date}</p>
                        <p className="text-xs text-gray-500">{time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Total Transaksi</p>
                        <p className="text-lg font-bold text-blue-700">{item.jumlahTransaksi}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Total Penjualan</p>
                            <p className="text-base font-bold text-green-700">
                              {formatRupiah(item.totalPenjualan)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            %
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Total Fee</p>
                            <p className="text-base font-bold text-orange-700">
                              {formatRupiah(item.totalFee)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            Rp
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Setoran Bersih</p>
                            <p className="text-lg font-bold text-blue-700">
                              {formatRupiah(item.totalSetoran)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

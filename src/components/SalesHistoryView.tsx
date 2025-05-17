
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils/format';
import { FileText } from 'lucide-react';

interface SalesItem {
  barang: string;
  jumlah: number;
  harga: number;
}

interface SalesEntry {
  date: string;
  items: SalesItem[];
  total: number;
}

interface SalesHistoryViewProps {
  salesHistory: SalesEntry[];
}

const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ salesHistory }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <FileText className="mr-2 h-5 w-5 text-green-600" />
        <h3 className="font-semibold">Riwayat Penjualan</h3>
      </div>

      {salesHistory.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          <p>Belum ada riwayat penjualan</p>
          <p className="text-sm mt-2">Rekam penjualan untuk melihat riwayat</p>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          {salesHistory.map((entry, index) => (
            <Card key={index} className="p-4 mb-4">
              <div className="text-sm text-gray-500 mb-2">
                {formatDate(entry.date)}
              </div>
              
              <div className="space-y-3">
                {entry.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between">
                    <div>
                      <span className="font-medium">{item.barang}</span>
                      <span className="text-gray-500 text-sm ml-2">x{item.jumlah}</span>
                    </div>
                    <div>
                      <span className="text-gray-800">{formatCurrency(item.harga * item.jumlah)}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        @{formatCurrency(item.harga)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(entry.total)}</span>
              </div>
            </Card>
          ))}
        </ScrollArea>
      )}
    </div>
  );
};

export default SalesHistoryView;

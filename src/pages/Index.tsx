
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Mic, 
  MicOff, 
  Check, 
  FileText, 
  Send 
} from 'lucide-react';
import SalesHistoryView from '@/components/SalesHistoryView';
import VoiceRecorder from '@/components/VoiceRecorder';
import { saveSalesData, getAllSalesData } from '@/utils/storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('rekam');
  const [apiKey, setApiKey] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);

  useEffect(() => {
    // Load sales history on component mount
    const loadSalesHistory = async () => {
      try {
        const history = await getAllSalesData();
        if (history && history.length > 0) {
          setSalesHistory(history);
        }
      } catch (error) {
        console.error('Error loading sales history:', error);
        toast.error('Gagal memuat riwayat penjualan');
      }
    };
    
    loadSalesHistory();
  }, []);

  const saveApiKey = () => {
    if (apiKey.trim().length > 0) {
      localStorage.setItem('openRouterApiKey', apiKey);
      setIsApiKeySet(true);
      toast.success('API Key berhasil disimpan');
    } else {
      toast.error('API Key tidak boleh kosong');
    }
  };

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openRouterApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setIsApiKeySet(true);
    }
  }, []);

  const handleTranscriptComplete = (text: string) => {
    setTranscript(text);
  };

  const processTranscript = async () => {
    if (!transcript.trim()) {
      toast.error('Tidak ada transkrip untuk diproses');
      return;
    }

    if (!isApiKeySet) {
      toast.error('Silakan atur API Key terlebih dahulu');
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Ekstrak data penjualan dari transkrip percakapan menjadi data dalam format JSON. Fokus pada barang yang TERJUAL. Format: nama barang, jumlah, harga satuan. Contoh: [{"barang": "Aqua", "jumlah": 2, "harga": 5000}]. Hanya ambil barang yang benar-benar dibeli dengan harga dan jumlah yang jelas disebutkan. Jika ada informasi yang tidak lengkap, abaikan item tersebut.'
            },
            {
              role: 'user',
              content: transcript
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Gagal memproses transkrip');
      }

      const content = data.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error('Format respon tidak valid');
      }
      
      const salesData = JSON.parse(jsonMatch[0]);
      
      // Calculate total for display purposes
      const salesWithDate = {
        items: salesData,
        date: new Date().toISOString(),
        total: salesData.reduce((sum: number, item: any) => sum + (item.jumlah * item.harga), 0)
      };
      
      // Save to storage
      await saveSalesData(salesWithDate);
      
      // Update state with new sale
      setSalesHistory(prevHistory => [salesWithDate, ...prevHistory]);
      
      // Success notification
      toast.success('Data penjualan berhasil disimpan');
      
      // Clear transcript after successful processing
      setTranscript('');
      
      // Switch to history tab
      setActiveTab('riwayat');
      
    } catch (error: any) {
      console.error('Error processing transcript:', error);
      toast.error(`Gagal memproses: ${error.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-600">WARAS</h1>
      <h2 className="text-xl text-center mb-8 text-gray-600">Warung Assistant</h2>
      
      {!isApiKeySet && (
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2">Pengaturan API</h3>
          <Input
            placeholder="Masukkan OpenRouter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mb-2"
          />
          <Button onClick={saveApiKey} className="w-full">Simpan API Key</Button>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="rekam">Rekam Penjualan</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Penjualan</TabsTrigger>
        </TabsList>

        <TabsContent value="rekam">
          <Card className="p-4">
            <VoiceRecorder onTranscriptComplete={handleTranscriptComplete} />
            
            {transcript && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Hasil Transkrip:</h3>
                <ScrollArea className="h-[120px] border rounded-md p-3 bg-gray-50">
                  <p>{transcript}</p>
                </ScrollArea>
                
                <div className="mt-4">
                  <Button 
                    onClick={processTranscript} 
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Memproses...' : 'Proses Transkrip'}
                    <Send className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="riwayat">
          <SalesHistoryView salesHistory={salesHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;

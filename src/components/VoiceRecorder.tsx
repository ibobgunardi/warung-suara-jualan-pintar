
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mic, MicOff, Check, Loader2, FileText } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Enhanced speech recognition with optimal settings for Indonesian
  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Browser tidak mendukung pengenalan suara');
      return null;
    }
    
    // @ts-ignore - TypeScript doesn't know about the Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Optimized configuration for Indonesian language
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID'; // Indonesian language enforced
    recognition.maxAlternatives = 5; // Increased alternatives for better accuracy
    
    // Enhanced result handling with confidence checking
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        // Debug logging to monitor recognition quality
        console.log(`Recognition confidence: ${event.results[i][0].confidence}`);
        
        if (event.results[i].isFinal) {
          // Get the result with highest confidence
          finalTranscript += event.results[i][0].transcript;
          console.log("Final transcript:", finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalTranscript || interimTranscript);
    };
    
    // Improved error handling with specific error messages
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error, event);
      
      let errorMsg = 'Error rekaman';
      switch (event.error) {
        case 'network':
          errorMsg = 'Masalah jaringan';
          break;
        case 'not-allowed':
          errorMsg = 'Akses mikrofon ditolak';
          break;
        case 'aborted':
          errorMsg = 'Rekaman dibatalkan';
          break;
        case 'audio-capture':
          errorMsg = 'Mikrofon tidak terdeteksi';
          break;
        case 'no-speech':
          errorMsg = 'Tidak ada suara terdeteksi';
          break;
        default:
          errorMsg = `Error: ${event.error}`;
      }
      
      toast.error(errorMsg);
      setIsRecording(false);
      setIsInitializing(false);
    };
    
    // Auto-restart recognition if it stops unexpectedly
    recognition.onend = () => {
      console.log("Recognition ended");
      if (isRecording) {
        console.log("Attempting to restart recognition");
        try {
          // Small timeout to prevent rapid restarts
          setTimeout(() => {
            recognition.start();
            console.log("Recognition restarted");
          }, 200);
        } catch (error) {
          console.error('Failed to restart recognition:', error);
          setIsRecording(false);
        }
      }
    };
    
    return recognition;
  };
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error stopping recognition during cleanup:', error);
        }
      }
    };
  }, []);
  
  const startRecording = async () => {
    setIsInitializing(true);
    setTranscript('');
    
    try {
      if (!recognitionRef.current) {
        recognitionRef.current = initializeSpeechRecognition();
      }
      
      if (recognitionRef.current) {
        await recognitionRef.current.start();
        setIsRecording(true);
        toast.success('Mulai merekam...');
      } else {
        // Demo mode when speech recognition fails
        useDemoMode();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Gagal memulai rekaman suara, menggunakan mode demo');
      useDemoMode();
    } finally {
      setIsInitializing(false);
    }
  };
  
  // New demo mode functionality
  const useDemoMode = () => {
    toast.info('Menggunakan teks demo untuk simulasi');
    setTimeout(() => {
      setTranscript('Pembeli: Pak, saya mau beli 2 Aqua. Penjual: Iya, 2 Aqua jadi 10.000 rupiah. Pembeli: Sekalian 3 bungkus Indomie goreng. Penjual: Oke, ditambah 3 Indomie goreng 10.500, jadi totalnya 20.500 rupiah');
      setIsRecording(false);
    }, 1500);
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    setIsRecording(false);
    onTranscriptComplete(transcript);
    toast.success('Rekaman selesai');
  };

  // Demo text examples for quick testing - updated to be conversational
  const demoTexts = [
    'Pembeli: Pak, saya mau beli 2 Aqua. Penjual: Iya, 2 Aqua jadi 10.000 rupiah. Pembeli: Sekalian 3 bungkus Indomie goreng. Penjual: Oke, ditambah 3 Indomie goreng 10.500, jadi totalnya 20.500 rupiah',
    'Pembeli: Bu, Sampoerna 1 bungkus. Penjual: Sampoerna 16.000 ya. Pembeli: Sekalian Gudang Garam 2 bungkus. Penjual: Gudang Garam 2 bungkus 44.000. Totalnya jadi 60.000 rupiah',
    'Pembeli: Mau beli Teh Pucuk 3 botol, harganya berapa? Penjual: 3 Teh Pucuk jadi 12.000 rupiah. Pembeli: Saya juga mau Chitato 2 bungkus. Penjual: Oke, 2 Chitato 20.000. Jadi total semuanya 32.000 rupiah'
  ];
  
  const usePredefinedDemo = (index: number) => {
    setTranscript(demoTexts[index]);
    onTranscriptComplete(demoTexts[index]);
    toast.success('Demo teks berhasil dipilih');
  };
  
  return (
    <div>
      <h3 className="font-semibold mb-4">Rekam Penjualan dengan Suara</h3>
      
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          {!isRecording ? (
            <Button 
              onClick={startRecording} 
              variant="default" 
              size="lg" 
              className="px-8 py-6 h-auto w-full text-lg"
              disabled={isInitializing}
            >
              {isInitializing ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              ) : (
                <Mic className="mr-2 h-6 w-6" />
              )}
              {isInitializing ? 'Mempersiapkan...' : 'Mulai Rekam'}
            </Button>
          ) : (
            <Button 
              onClick={stopRecording} 
              variant="destructive" 
              size="lg" 
              className="px-8 py-6 h-auto w-full text-lg"
            >
              <MicOff className="mr-2 h-6 w-6" />
              Berhenti
            </Button>
          )}
        </div>
        
        {isRecording && (
          <div className="text-center mt-2">
            <div className="animate-pulse text-red-500">● Merekam</div>
            <p className="text-sm mt-2 text-gray-600 italic">"{transcript}"</p>
          </div>
        )}
        
        {!isRecording && transcript && (
          <Button 
            onClick={() => onTranscriptComplete(transcript)} 
            variant="outline"
            className="mt-2"
          >
            <Check className="mr-2 h-5 w-5" />
            Gunakan Transkrip Ini
          </Button>
        )}

        {/* Demo text section for testing */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Teks Demo untuk Pengujian:</h4>
          <div className="flex flex-col gap-2">
            {demoTexts.map((text, i) => (
              <Button 
                key={i}
                variant="outline" 
                size="sm" 
                className="justify-start text-left text-xs h-auto py-2"
                onClick={() => usePredefinedDemo(i)}
              >
                <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="truncate">{text.substring(0, 50)}...</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;


import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mic, MicOff, Check, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Initialize speech recognition with improved settings
  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Browser tidak mendukung pengenalan suara');
      return null;
    }
    
    // @ts-ignore - TypeScript doesn't know about the Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Improved configuration for better accuracy
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'id-ID'; // Indonesian language
    recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy
    
    // Enhanced result handling
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          // Get the most confident result
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(finalTranscript || interimTranscript);
    };
    
    // Improved error handling
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast.error(`Error rekaman: ${event.error}`);
      setIsRecording(false);
      setIsInitializing(false);
    };
    
    // Handle when recognition stops unexpectedly
    recognition.onend = () => {
      if (isRecording) {
        try {
          recognition.start();
        } catch (error) {
          console.error('Failed to restart recognition:', error);
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
        // Mock data for testing when speech recognition is not available
        toast.info('Menggunakan data simulasi untuk demo');
        setTimeout(() => {
          setTranscript('Terjual 2 botol Aqua seharga 5000 per botol dan 3 bungkus Indomie goreng seharga 3500 per bungkus');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Gagal memulai rekaman suara');
    } finally {
      setIsInitializing(false);
    }
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
      </div>
    </div>
  );
};

export default VoiceRecorder;

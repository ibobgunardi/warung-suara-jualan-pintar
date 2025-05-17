
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mic, MicOff, Check } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
}

// Mock implementation for web preview
// In a real Expo/React Native app, we would use react-native-voice or expo-speech
const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // For web preview, we'll use the Web Speech API
  // Note: In a real React Native app, this would be replaced with react-native-voice
  useEffect(() => {
    let recognition: any = null;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't know about the Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID'; // Indonesian language
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Error rekaman: ${event.error}`);
        setIsRecording(false);
      };
    }
    
    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);
  
  const startRecording = () => {
    setTranscript('');
    
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't know about the Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID'; // Indonesian language
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognition.onend = () => {
        if (isRecording) {
          recognition.start();
        }
      };
      
      recognition.start();
      setIsRecording(true);
      
      // Store recognition instance in window to access it later
      // @ts-ignore
      window.recognition = recognition;
      
      toast.success('Mulai merekam...');
    } else {
      toast.error('Browser tidak mendukung pengenalan suara');
      
      // Mock data for testing when speech recognition is not available
      setTimeout(() => {
        setTranscript('Terjual 2 botol Aqua seharga 5000 per botol dan 3 bungkus Indomie goreng seharga 3500 per bungkus');
      }, 2000);
    }
  };
  
  const stopRecording = () => {
    // @ts-ignore
    if (window.recognition) {
      // @ts-ignore
      window.recognition.stop();
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
            >
              <Mic className="mr-2 h-6 w-6" />
              Mulai Rekam
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

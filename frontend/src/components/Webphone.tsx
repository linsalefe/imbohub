'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, PhoneOff, PhoneIncoming, X, Mic, MicOff } from 'lucide-react';
import { Device, Call } from '@twilio/voice-sdk';

type CallStatus = 'idle' | 'connecting' | 'ringing' | 'in-call' | 'incoming';

export default function Webphone() {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showDialer, setShowDialer] = useState(false);
  const [incomingFrom, setIncomingFrom] = useState('');
  const [error, setError] = useState('');
  const [deviceReady, setDeviceReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initStartedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        try { deviceRef.current.destroy(); } catch (e) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Escutar evento de ligação da página de conversas
  useEffect(() => {
    const handler = (e: any) => {
      const phone = e.detail?.phone || '';
      if (phone) {
        setPhoneNumber(phone);
        setShowDialer(true);
        if (!deviceReady && !initStartedRef.current) initDevice();
      }
    };
    window.addEventListener('eduflow-call', handler);
    return () => window.removeEventListener('eduflow-call', handler);
  }, [deviceReady]);

  const initDevice = useCallback(async () => {
    if (initStartedRef.current) return;
    initStartedRef.current = true;
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Faça login primeiro');
        initStartedRef.current = false;
        setLoading(false);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';
      const res = await fetch(`${API_URL}/twilio/token`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Erro ao obter token de voz');
      }

      const data = await res.json();
      const twilioToken = data.token;

      const device = new Device(twilioToken, {
        codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        closeProtection: true,
        logLevel: 1,
      });

      device.on('registered', () => {
        console.log('📞 Twilio Device registrado e pronto');
        setDeviceReady(true);
        setLoading(false);
        setError('');
      });

      device.on('error', (err: any) => {
        console.error('📞 Twilio Error:', err);
        setError(err.message || 'Erro no dispositivo');
        setLoading(false);
      });

      device.on('unregistered', () => {
        console.log('📞 Twilio Device desregistrado');
        setDeviceReady(false);
      });

      device.on('incoming', (call: Call) => {
        callRef.current = call;
        setIncomingFrom(call.parameters?.From || 'Desconhecido');
        setStatus('incoming');

        call.on('disconnect', () => handleCallEnd());
        call.on('cancel', () => handleCallEnd());
        call.on('reject', () => handleCallEnd());
      });

      await device.register();
      deviceRef.current = device;
    } catch (err: any) {
      console.error('Erro ao inicializar Twilio:', err);
      setError(err.message || 'Erro ao conectar');
      initStartedRef.current = false;
      setLoading(false);
    }
  }, []);

  const handleCallEnd = () => {
    setStatus('idle');
    setCallDuration(0);
    setMuted(false);
    callRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const makeCall = async () => {
    if (!deviceRef.current || !phoneNumber.trim()) return;

    let number = phoneNumber.replace(/\D/g, '');
    if (!number.startsWith('55')) number = '55' + number;
    number = '+' + number;

    setStatus('connecting');
    setError('');

    try {
      const call = await deviceRef.current.connect({
        params: { To: number },
      });

      callRef.current = call;

      call.on('ringing', () => {
        console.log('📞 Chamando...');
        setStatus('ringing');
      });

      call.on('accept', () => {
        console.log('📞 Chamada aceita');
        setStatus('in-call');
        startTimer();
      });

      call.on('disconnect', () => {
        console.log('📞 Chamada encerrada');
        handleCallEnd();
      });

      call.on('cancel', () => {
        console.log('📞 Chamada cancelada');
        handleCallEnd();
      });

      call.on('error', (err: any) => {
        console.error('📞 Erro na chamada:', err);
        setError(err.message || 'Erro na chamada');
        handleCallEnd();
      });
    } catch (err: any) {
      console.error('Erro ao fazer chamada:', err);
      setError(err.message || 'Erro ao iniciar chamada');
      setStatus('idle');
    }
  };

  const acceptCall = () => {
    if (callRef.current) {
      callRef.current.accept();
      setStatus('in-call');
      startTimer();
    }
  };

  const rejectCall = () => {
    if (callRef.current) {
      callRef.current.reject();
      handleCallEnd();
    }
  };

  const hangUp = () => {
    if (callRef.current) {
      callRef.current.disconnect();
    }
    if (deviceRef.current) {
      deviceRef.current.disconnectAll();
    }
    handleCallEnd();
  };

  const toggleMute = () => {
    if (callRef.current) {
      const newMuted = !muted;
      callRef.current.mute(newMuted);
      setMuted(newMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDialerToggle = () => {
    const opening = !showDialer;
    setShowDialer(opening);
    if (opening && !deviceReady && !initStartedRef.current) {
      initDevice();
    }
  };

  const dialPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

  // Chamada recebida
  if (status === 'incoming') {
    return (
      <div className="fixed bottom-6 right-6 z-50 rounded-2xl p-6 shadow-2xl w-[300px] animate-pulse" style={{ backgroundColor: 'var(--sidebar)', border: '1px solid var(--success)', boxShadow: '0 0 30px rgba(93, 122, 58, 0.15)' }}>
        <div className="text-center">
          <PhoneIncoming className="w-10 h-10 mx-auto mb-3 animate-bounce" style={{ color: 'var(--success)' }} />
          <p className="text-white font-semibold text-lg">Chamada recebida</p>
          <p className="text-sm mt-1" style={{ color: 'var(--sidebar-text)' }}>{incomingFrom}</p>
          <div className="flex gap-3 mt-5 justify-center">
            <button
              onClick={acceptCall}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: 'var(--success)' }}
            >
              <Phone className="w-4 h-4" /> Atender
            </button>
            <button
              onClick={rejectCall}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl transition-colors"
              style={{ backgroundColor: 'var(--danger)' }}
            >
              <PhoneOff className="w-4 h-4" /> Recusar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Em chamada
  if (status === 'in-call' || status === 'connecting' || status === 'ringing') {
    return (
      <div className="fixed bottom-6 right-6 z-50 rounded-2xl p-4 shadow-2xl w-[280px]" style={{ backgroundColor: 'var(--sidebar)', border: '1px solid var(--sidebar-border)' }}>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--sidebar-text)' }}>
            {status === 'connecting' ? 'Conectando...' : status === 'ringing' ? 'Chamando...' : 'Em chamada'}
          </p>
          <p className="text-white font-semibold">{phoneNumber}</p>
          {status === 'in-call' && (
            <p className="text-2xl font-mono mt-2" style={{ color: 'var(--primary)' }}>{formatDuration(callDuration)}</p>
          )}
          <div className="flex gap-3 mt-4 justify-center">
            <button
              onClick={toggleMute}
              className="p-3 rounded-xl transition-colors"
              style={{
                backgroundColor: muted ? 'var(--warning-light)' : 'rgba(255,255,255,0.05)',
                color: muted ? 'var(--warning)' : 'var(--sidebar-text)',
              }}
            >
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={hangUp}
              className="p-3 rounded-xl text-white transition-colors"
              style={{ backgroundColor: 'var(--danger)' }}
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Botão flutuante + discador
  return (
    <>
      <button
        onClick={handleDialerToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{ backgroundColor: deviceReady ? 'var(--primary)' : 'var(--muted)' }}
      >
        {showDialer ? <X className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white" style={{
          backgroundColor: (status as string) === 'in-call' ? 'var(--danger)' : deviceReady ? 'var(--success)' : 'var(--muted)',
        }} />
      </button>

      {showDialer && (
        <div className="fixed bottom-24 right-6 z-50 rounded-2xl p-5 shadow-2xl w-[300px]" style={{ backgroundColor: 'var(--sidebar)', border: '1px solid var(--sidebar-border)' }}>
          <p className="text-white font-semibold text-sm mb-3">Discador</p>

          {error && (
            <p className="text-xs mb-2 px-3 py-1.5 rounded-lg" style={{ color: 'var(--danger)', backgroundColor: 'var(--danger-light)' }}>{error}</p>
          )}

          {loading && (
            <p className="text-xs mb-2 px-3 py-1.5 rounded-lg" style={{ color: 'var(--warning)', backgroundColor: 'var(--warning-light)' }}>Conectando ao servidor de voz...</p>
          )}

          {deviceReady && (
            <p className="text-xs mb-2 px-3 py-1.5 rounded-lg" style={{ color: 'var(--success)', backgroundColor: 'var(--success-light)' }}>Pronto para ligações</p>
          )}

          <input
            type="tel"
            placeholder="(00) 00000-0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-white/5 rounded-xl px-4 py-3 text-white text-center text-lg font-mono placeholder-gray-600 mb-3"
            style={{ border: '1px solid var(--sidebar-border)' }}
          />

          <div className="grid grid-cols-3 gap-2 mb-4">
            {dialPad.map((key) => (
              <button
                key={key}
                onClick={() => setPhoneNumber((prev) => prev + key)}
                className="bg-white/5 hover:bg-white/10 text-white text-lg font-medium py-2.5 rounded-xl transition-colors"
              >
                {key}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPhoneNumber((prev) => prev.slice(0, -1))}
              className="flex-1 bg-white/5 hover:bg-white/10 py-2.5 rounded-xl text-sm transition-colors"
              style={{ color: 'var(--sidebar-text)' }}
            >
              Apagar
            </button>
            <button
              onClick={makeCall}
              disabled={!phoneNumber.trim() || !deviceReady}
              className="flex-1 disabled:opacity-30 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Phone className="w-4 h-4" /> Ligar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
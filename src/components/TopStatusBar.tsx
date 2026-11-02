import React from 'react';
import { Volume2, VolumeX, ShieldAlert, Clock, Activity, Cpu } from 'lucide-react';
import { UserLevel, GameScreen } from '../types/simulation';
import { soundManager } from '../utils/audio';

interface TopStatusBarProps {
  currentScreen: GameScreen;
  userLevel: UserLevel;
  countdownSeconds: number;
  currentStepNumber: number;
  totalSteps: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  currentScreen,
  userLevel,
  countdownSeconds,
  currentStepNumber,
  totalSteps,
  soundEnabled,
  onToggleSound,
  onRestart,
}) => {
  const isEmergency = countdownSeconds <= 15 && userLevel === 'experienced';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1F2937] bg-[#0A0F1D]/95 backdrop-blur-md">
      {/* Top 2px status line accent */}
      <div className={`h-[2px] w-full ${isEmergency ? 'bg-[#EF4444] animate-pulse' : 'bg-[#6366F1]'}`} />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-4">
        {/* Left: Brand & Status */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRestart}
            title="Kriz Odasını Yeniden Başlat"
            className="flex items-center space-x-2 text-left transition hover:opacity-85"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-[#6366F1]/40 bg-[#111827] text-[#6366F1] shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-mono text-xs font-bold tracking-wider text-[#F9FAFB]">SE PRIMER</span>
                <span className="rounded-[4px] border border-[#EF4444]/40 bg-[#EF4444]/15 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-[#EF4444]">
                  SEV-1
                </span>
              </div>
              <p className="hidden font-mono text-[10px] text-[#9CA3AF] sm:block">
                Muhteşem Cuma (00:00) Ödeme Kriz Simülasyonu
              </p>
            </div>
          </button>
        </div>

        {/* Center: Live Telemetry & Step */}
        {currentScreen === 'crisis' && (
          <div className="flex items-center space-x-3">
            {/* Step Indicator */}
            <div className="hidden rounded-[4px] border border-[#1F2937] bg-[#111827] px-2.5 py-1 font-mono text-xs text-[#9CA3AF] sm:flex sm:items-center sm:space-x-1.5">
              <span className="text-[#6366F1]">ADIM</span>
              <span className="font-bold text-[#F9FAFB]">{currentStepNumber}/{totalSteps}</span>
            </div>

            {/* Live RPS Telemetry */}
            <div className="flex items-center space-x-1.5 rounded-[4px] border border-[#1F2937] bg-[#111827] px-2.5 py-1 font-mono text-xs">
              <Activity className="h-3.5 w-3.5 text-[#EF4444] animate-pulse" />
              <span className="text-[#9CA3AF]">TRAFİK:</span>
              <span className="font-bold text-[#EF4444]">42.5K RPS</span>
            </div>

            {/* Experienced Mode 60s Countdown Timer */}
            {userLevel === 'experienced' ? (
              <div
                className={`flex items-center space-x-1.5 rounded-[4px] border px-2.5 py-1 font-mono text-xs transition ${
                  isEmergency
                    ? 'border-[#EF4444] bg-[#EF4444]/20 text-[#EF4444] glow-sev1 animate-pulse'
                    : 'border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B]'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">KRİZ SAYACI:</span>
                <span data-cy="countdown" className="font-bold tracking-widest text-sm">
                  {Math.floor(countdownSeconds / 60)}:{String(countdownSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            ) : (
              <div className="hidden rounded-[4px] border border-[#10B981]/30 bg-[#10B981]/10 px-2 py-1 font-mono text-[11px] text-[#10B981] md:flex md:items-center md:space-x-1">
                <span>REHBERLİ MOD</span>
                <span className="text-white/40">|</span>
                <span className="text-[#9CA3AF]">İpuçları Aktif</span>
              </div>
            )}
          </div>
        )}

        {/* Right: Controls & Sound Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              onToggleSound();
              soundManager.playClick();
            }}
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#1F2937] bg-[#111827] text-[#9CA3AF] transition hover:border-[#6366F1] hover:text-[#F9FAFB]"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-[#6366F1]" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {currentScreen !== 'onboarding' && (
            <button
              onClick={() => {
                soundManager.playClick();
                onRestart();
              }}
              className="rounded-[4px] border border-[#1F2937] bg-[#111827] px-2.5 py-1.5 font-mono text-[11px] text-[#9CA3AF] transition hover:border-[#EF4444] hover:text-[#EF4444]"
            >
              [SIFIRLA]
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

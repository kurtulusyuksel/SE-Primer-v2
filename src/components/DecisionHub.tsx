import React, { useState } from 'react';
import { DecisionStep, DecisionChoice, UserLevel } from '../types/simulation';
import { AlertCircle, Server, CheckCircle2, ArrowRight, ShieldAlert, Cpu, Database, Activity, RefreshCw } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DecisionHubProps {
  currentScenario: DecisionStep;
  userLevel: UserLevel;
  onMakeChoice: (choice: DecisionChoice) => void;
  isProcessing: boolean;
  selectedChoice: DecisionChoice | null;
  onProceedNext: () => void;
  isLastStep: boolean;
  collecting: boolean;
  labelValue: 0 | 1 | null;
  onLabel: (value: 0 | 1) => void;
  labelMessage: string;
}

export const DecisionHub: React.FC<DecisionHubProps> = ({
  currentScenario,
  userLevel,
  onMakeChoice,
  isProcessing,
  selectedChoice,
  onProceedNext,
  isLastStep,
  collecting,
  labelValue,
  onLabel,
  labelMessage,
}) => {
  const [hoveredChoice, setHoveredChoice] = useState<'A' | 'B' | null>(null);
  const labelMissing = collecting && labelValue === null && !selectedChoice;

  const handleSelect = (choice: DecisionChoice) => {
    if (selectedChoice || isProcessing) return;
    if (choice.id === 'B' && currentScenario.id === 'step3') {
      soundManager.playCriticalBreach();
    } else if (choice.id === 'A') {
      soundManager.playSuccess();
    } else {
      soundManager.playAlarm();
    }
    onMakeChoice(choice);
  };

  return (
    <div className="space-y-4">
      {/* Active Crisis Incident Card */}
      <div className="rounded-[8px] border border-[#1F2937] bg-[#111827] p-4 shadow-xl">
        {/* Step & Category Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1F2937] pb-3">
          <div className="flex items-center space-x-2">
            <span className="rounded-[4px] border border-[#6366F1]/50 bg-[#6366F1]/15 px-2 py-0.5 font-mono text-[11px] font-bold text-[#A5B4FC]">
              KARAR {currentScenario.stepNumber} / {currentScenario.totalSteps}
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
              [{currentScenario.category}]
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="rounded-[4px] border border-[#EF4444]/40 bg-[#EF4444]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#EF4444] glow-sev1 animate-pulse">
              {currentScenario.sevLevel} KRİTİK ALARM
            </span>
            <span className="font-mono text-xs text-[#9CA3AF]">
              servis: <code className="text-[#F9FAFB]">checkout-gateway-api</code>
            </span>
          </div>
        </div>

        {/* Title & Incident Subtitle */}
        <div className="mt-3">
          <h2 className="text-lg font-bold text-[#F9FAFB] sm:text-xl">
            {currentScenario.title}
          </h2>
          <div className="mt-1 flex items-center space-x-1.5 font-mono text-xs text-[#F59E0B]">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{currentScenario.incidentSubtitle}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF] sm:text-sm">
            {currentScenario.contextDescription}
          </p>
        </div>

        {/* Live Telemetry Matrix */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-[6px] border border-[#1F2937] bg-[#0A0F1D] p-3 sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#9CA3AF]">TRAFİK (RPS)</span>
            <span className="font-mono text-sm font-bold text-[#EF4444] sm:text-base">
              {currentScenario.metricsBefore.rps}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#9CA3AF]">GECİKME (p99)</span>
            <span className="font-mono text-sm font-bold text-[#F59E0B] sm:text-base">
              {currentScenario.metricsBefore.p99}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#9CA3AF]">DB CONNECTION POOL</span>
            <span className="font-mono text-sm font-bold text-[#EF4444] sm:text-base">
              {currentScenario.metricsBefore.dbPool}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#9CA3AF]">HATA ORANI</span>
            <span className="font-mono text-sm font-bold text-[#EF4444] sm:text-base">
              {currentScenario.metricsBefore.errorRate}
            </span>
          </div>
        </div>
      </div>

      {/* Decision Choice Cards */}
      <div className="space-y-3">
        {collecting && !selectedChoice && (
          <div data-cy="label-panel" className="rounded-[8px] border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[#FDE68A]">
                Karar öncesi tek soru: bu adımda yönlendirici bir ipucuna ihtiyacın var mı?
              </p>
              <span className="font-mono text-[10px] text-[#F59E0B]">Her sahnede 1 kez</span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                data-cy="label-yes"
                onClick={() => onLabel(1)}
                className={`rounded-[4px] border px-3 py-2 font-mono text-xs font-bold transition ${
                  labelValue === 1
                    ? 'border-[#F59E0B] bg-[#F59E0B] text-[#0A0F1D]'
                    : 'border-[#F59E0B]/50 bg-[#0A0F1D] text-[#FDE68A] hover:bg-[#F59E0B]/20'
                }`}
              >
                Evet, ipucu gerekli
              </button>
              <button
                type="button"
                data-cy="label-no"
                onClick={() => onLabel(0)}
                className={`rounded-[4px] border px-3 py-2 font-mono text-xs font-bold transition ${
                  labelValue === 0
                    ? 'border-[#10B981] bg-[#10B981] text-[#0A0F1D]'
                    : 'border-[#10B981]/50 bg-[#0A0F1D] text-[#A7F3D0] hover:bg-[#10B981]/20'
                }`}
              >
                Hayır, kendim ilerleyebilirim
              </button>
            </div>
            <p data-cy="label-state" role="status" className="mt-2 text-[11px] text-[#D1D5DB]">
              {labelValue !== null
                ? 'Etiket seçildi — şimdi aşağıdan A/B kararını verebilirsin.'
                : labelMessage || 'Bu etiket doğru/yanlış sonucuna göre değil, yalnızca o anki ihtiyacına göre seçilir.'}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between font-mono text-xs text-[#9CA3AF]">
          <span className="font-semibold uppercase tracking-wider">
            Müdahale Eylemini Seçin:
          </span>
          {userLevel === 'beginner' && (
            <span className="text-[#10B981] text-[11px] font-medium">
              [💡 Rehberli Mod: İpuçları Açık]
            </span>
          )}
          {userLevel === 'experienced' && (
            <span className="text-[#EF4444] text-[11px] font-medium">
              [⚠️ Stres Modu: İpuçları Gizli]
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {currentScenario.choices.map((choice) => {
            const isChosen = selectedChoice?.id === choice.id;
            const isOtherChosen = selectedChoice && selectedChoice.id !== choice.id;

            return (
              <div
                key={choice.id}
                onMouseEnter={() => setHoveredChoice(choice.id)}
                onMouseLeave={() => setHoveredChoice(null)}
                className={`relative flex flex-col justify-between rounded-[8px] border p-4 transition-all duration-200 ${
                  isChosen
                    ? choice.id === 'A'
                      ? 'border-[#10B981] bg-[#10B981]/10 glow-emerald'
                      : 'border-[#EF4444] bg-[#EF4444]/10 glow-sev1'
                    : isOtherChosen
                    ? 'border-[#1F2937]/50 bg-[#111827]/40 opacity-40'
                    : 'border-[#1F2937] bg-[#111827] hover:border-[#6366F1]/70 hover:bg-[#151C2C]'
                }`}
              >
                <div>
                  {/* Choice Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-[4px] border border-[#6366F1]/50 bg-[#0A0F1D] font-mono text-xs font-bold text-[#6366F1]">
                        {choice.id}
                      </span>
                      <span className="rounded-[4px] border border-[#1F2937] bg-[#0A0F1D] px-2 py-0.5 font-mono text-[10px] text-[#9CA3AF]">
                        {choice.badge}
                      </span>
                    </div>

                    {isChosen && (
                      <span
                        className={`rounded-[4px] px-2 py-0.5 font-mono text-[10px] font-bold ${
                          choice.id === 'A'
                            ? 'border border-[#10B981]/50 bg-[#10B981]/20 text-[#10B981]'
                            : 'border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#EF4444]'
                        }`}
                      >
                        [UYGULANDI]
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2.5 text-sm font-bold text-[#F9FAFB] sm:text-base">
                    {choice.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-relaxed text-[#9CA3AF]">
                    {choice.description}
                  </p>

                  {/* Architectural Hint (Only visible in Beginner Mode) */}
                  {userLevel === 'beginner' && choice.hint && (
                    <div className="mt-3 rounded-[4px] border border-[#6366F1]/30 bg-[#6366F1]/10 p-2.5 text-[11px] leading-relaxed text-[#C7D2FE]">
                      {choice.hint}
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="mt-4 pt-2 border-t border-[#1F2937]/60">
                  {!selectedChoice ? (
                    <button
                      type="button"
                      onClick={() => handleSelect(choice)}
                      disabled={isProcessing || labelMissing}
                      title={labelMissing ? 'Önce yukarıdaki ihtiyaç etiketini seç.' : undefined}
                      className={`flex w-full items-center justify-center space-x-2 rounded-[4px] py-2.5 font-mono text-xs font-bold transition active:scale-[0.98] ${
                        labelMissing ? 'cursor-not-allowed opacity-40 ' : ''
                      }${
                        choice.id === 'A'
                          ? 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                          : 'border border-[#EF4444]/60 bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30'
                      }`}
                    >
                      <span>{choice.id} ŞIKKINI DEVREYE AL</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : isChosen ? (
                    <div className="font-mono text-xs text-[#F9FAFB]">
                      <span className="text-[#9CA3AF]">Simülasyon Etkisi: </span>
                      <span className={choice.id === 'A' ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                        {choice.consequenceSummary}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post-Choice Next Step Bar */}
      {selectedChoice && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-[8px] border border-[#6366F1]/50 bg-[#111827] p-4 shadow-xl sm:flex-row">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center space-x-2 sm:justify-start font-mono text-xs font-semibold text-[#10B981]">
              <CheckCircle2 className="h-4 w-4" />
              <span>Teknik Müdahale Gerçekleştirildi (Loglar Güncellendi)</span>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              {selectedChoice.technicalImpact}
            </p>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onProceedNext();
            }}
            className="flex w-full shrink-0 items-center justify-center space-x-2 rounded-[4px] bg-[#6366F1] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] transition hover:bg-[#4F46E5] sm:w-auto"
          >
            <span>{isLastStep ? 'Post-Mortem & Sonuç Raporu' : 'Sonraki Kriz Adımına Geç'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

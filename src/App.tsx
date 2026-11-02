import React, { useState, useEffect, useRef } from 'react';
import { GameScreen, UserLevel, DecisionChoice, DecisionRecord, OutcomeType, StepId } from './types/simulation';
import { CRISIS_SCENARIOS } from './data/scenarios';
import { TopStatusBar } from './components/TopStatusBar';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DecisionHub } from './components/DecisionHub';
import { IncidentTerminal, IncidentLogItem } from './components/IncidentTerminal';
import { SocratesWidget } from './components/SocratesWidget';
import { PostMortemScreen } from './components/PostMortemScreen';
import { soundManager } from './utils/audio';

import { ModelLab } from './components/ModelLab';
import { Features, infer, interventionAllowed, Prediction } from './utils/modelInference';
import { saveRow, exportRows, clearRows, getRows, completedSessionCount, collectionModeEnabled, rememberCollectionMode } from './utils/sessionData';

const INITIAL_LOGS: IncidentLogItem[] = [
  {
    id: 'l-0',
    timestamp: '00:00:01.002',
    level: 'INFO',
    tag: 'TRAFFIC_MONITOR',
    message: 'Black Friday sale campaign opened globally. RPS jumping from 1,200 to 42,500 RPS.',
  },
  {
    id: 'l-1',
    timestamp: '00:00:04.221',
    level: 'WARN',
    tag: 'HTTP_GATEWAY',
    message: 'Upstream payment cluster latency spiked to 1,850ms. p99 SLA breached (>250ms).',
  },
  {
    id: 'l-2',
    timestamp: '00:00:08.840',
    level: 'ERROR',
    tag: 'DB_CONNECTION',
    message: 'HikariCP connection pool saturated: 98/100 active connections in use. Waiting queue: 4,120.',
  },
  {
    id: 'l-3',
    timestamp: '00:00:14.390',
    level: 'FATAL',
    tag: 'PG_DEADLOCK',
    message: 'SEV-1 ALERT: Deadlock detected in table "orders_v2". Transaction rollback rate %38.4.',
  },
];

export default function App() {
  if (new URLSearchParams(location.search).has('model-lab')) return <ModelLab />;
  return <Simulation />;
}

function Simulation() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('onboarding');
  const [userLevel, setUserLevel] = useState<UserLevel>('beginner');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedChoices, setSelectedChoices] = useState<Partial<Record<StepId, DecisionChoice['id']>>>({});
  const [decisionRecords, setDecisionRecords] = useState<DecisionRecord[]>([]);
  const [currentStepChoice, setCurrentStepChoice] = useState<DecisionChoice | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(60);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [incidentLogs, setIncidentLogs] = useState<IncidentLogItem[]>(INITIAL_LOGS);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [collectionMode, setCollectionMode] = useState<boolean>(collectionModeEnabled);
  const [sessionId, setSessionId] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const stepStarted = useRef(performance.now());
  const [hintCount, setHintCount] = useState(0);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [modelError, setModelError] = useState('');
  const [brake, setBrake] = useState(false);
  const [intervention, setIntervention] = useState(false);
  const [label, setLabel] = useState<{ value: 0 | 1; features: Features } | null>(null);
  const [collectionMessage, setCollectionMessage] = useState('');
  const [savedRows, setSavedRows] = useState(() => getRows().length);
  const [completedSessions, setCompletedSessions] = useState(() => completedSessionCount());
  const features: Features = [userLevel === 'experienced' ? 1 : 0, Math.min(600, elapsed),
    decisionRecords.filter(record => record.choiceId === 'B').length, Math.min(30, hintCount), currentStepIndex + 1];
  const sessionDecisions = sessionId ? getRows().filter(row => row.oturum_id === sessionId).length : 0;

  useEffect(() => {
    if (currentScreen !== 'crisis' || currentStepChoice) return;
    const tick = setInterval(() => setElapsed(Math.floor((performance.now() - stepStarted.current) / 1000)), 1000);
    return () => clearInterval(tick);
  }, [currentScreen, currentStepIndex, currentStepChoice]);

  useEffect(() => {
    if (currentScreen !== 'crisis' || currentStepChoice) return;
    let disposed = false;
    infer(features).then(result => {
      if (disposed) return;
      setPrediction(result); setModelError('');
      // Veri toplarken etiketi etkilememek için müdahale kapalı (shadow).
      if (!collectionMode && result.needed && interventionAllowed(result.release, sessionId)) {
        setBrake(true); setIntervention(true);
      }
    }).catch(() => { if (!disposed) setModelError('Model kullanılamıyor; normal oyun ve manuel mentor açık.'); });
    return () => { disposed = true; };
  }, [currentScreen, currentStepIndex, currentStepChoice, elapsed, hintCount, collectionMode, sessionId, userLevel]);

  const resetScene = () => {
    stepStarted.current = performance.now(); setElapsed(0); setPrediction(null);
    setBrake(false); setIntervention(false); setLabel(null); setCollectionMessage('');
  };

  // Each decision in Experienced Mode has its own 60-second timer.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (currentScreen === 'crisis' && userLevel === 'experienced' && !currentStepChoice && !brake && countdownSeconds > 0) {
      interval = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            if (interval) clearInterval(interval);
            soundManager.playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval !== undefined) clearInterval(interval);
    };
  }, [currentScreen, userLevel, currentStepIndex, currentStepChoice, brake]);

  const handleStartSimulation = (level: UserLevel) => {
    resetScene(); setHintCount(0); setSessionId(crypto.randomUUID());
    setUserLevel(level);
    setCurrentScreen('crisis');
    setCurrentStepIndex(0);
    setSelectedChoices({});
    setDecisionRecords([]);
    setCurrentStepChoice(null);
    setCountdownSeconds(60);
    setIncidentLogs(INITIAL_LOGS);
  };

  const handleRestart = () => {
    resetScene(); setHintCount(0);
    setCurrentScreen('onboarding');
    setCurrentStepIndex(0);
    setSelectedChoices({});
    setDecisionRecords([]);
    setCurrentStepChoice(null);
    setCountdownSeconds(60);
    setIncidentLogs(INITIAL_LOGS);
  };

  const currentScenario = CRISIS_SCENARIOS[currentStepIndex];

  const handleMakeChoice = (choice: DecisionChoice) => {
    if (currentStepChoice) return;
    if (collectionMode && !label) {
      setCollectionMessage('Karardan önce bu adımda ipucuna ihtiyaç duyup duymadığını işaretle.'); return;
    }
    if (collectionMode && label) {
      try {
        saveRow({ oturum_id: sessionId, kaynak: 'gercek', features: label.features, ipucu_gerekli: label.value });
        setSavedRows(getRows().length);
        setCompletedSessions(completedSessionCount());
      } catch { setCollectionMessage('Yerel kayıt başarısız. Depolama iznini kontrol et veya veri toplamayı kapat.'); return; }
    }
    setIsProcessing(true);
    setCurrentStepChoice(choice);

    // Save choice in state
    setSelectedChoices((prev) => ({
      ...prev,
      [currentScenario.id]: choice.id,
    }));

    // Record decision for post-mortem trace
    const record: DecisionRecord = {
      stepId: currentScenario.id,
      stepTitle: currentScenario.title,
      choiceId: choice.id,
      choiceTitle: choice.title,
      consequenceSummary: choice.consequenceSummary,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      impactScore: choice.id === 'A' ? 100 : 0,
    };
    setDecisionRecords((prev) => [...prev, record]);

    // Append consequence logs into terminal
    const newLogs: IncidentLogItem[] = choice.logsTriggered.map((l, idx) => ({
      id: `choice-log-${Date.now()}-${idx}`,
      timestamp: l.timestamp,
      level: l.level,
      tag: l.tag,
      message: l.message,
    }));

    setIncidentLogs((prev) => [...prev, ...newLogs]);
    setIsProcessing(false);
  };

  const handleProceedNext = () => {
    if (currentStepIndex < CRISIS_SCENARIOS.length - 1) {
      resetScene();
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentStepChoice(null);
      setCountdownSeconds(60);
    } else {
      // Reached end of simulation -> evaluate outcome
      setCurrentScreen('result');
      if (soundEnabled) {
        const isGood = evaluateOutcome() === 'outcome_a';
        if (isGood) soundManager.playSuccess();
        else soundManager.playCriticalBreach();
      }
    }
  };

  // Any B choice represents a failed intervention and results in Son B.
  const evaluateOutcome = (): OutcomeType => {
    return Object.values(selectedChoices).includes('B') ? 'outcome_b' : 'outcome_a';
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-[#F9FAFB] flex flex-col justify-between selection:bg-[#6366F1] selection:text-white">
      {/* Top Navigation & Live Telemetry Bar */}
      <TopStatusBar
        currentScreen={currentScreen}
        userLevel={userLevel}
        countdownSeconds={countdownSeconds}
        currentStepNumber={currentStepIndex + 1}
        totalSteps={CRISIS_SCENARIOS.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(soundManager.toggleSound())}
        onRestart={handleRestart}
      />

      {currentScreen === 'onboarding' && <section className="mx-auto w-full max-w-3xl p-4 space-y-3 bg-slate-900 rounded-lg">
        <label className="flex gap-3"><input data-cy="collection-mode" type="checkbox" checked={collectionMode}
          onChange={event => { setCollectionMode(event.target.checked); rememberCollectionMode(event.target.checked); }} />Gerçek oturum veri toplama modu (gönüllü)</label>
        <p data-cy="collection-state" className={collectionMode ? 'text-sm text-emerald-300' : 'text-sm text-amber-300'}>
          {collectionMode
            ? 'Veri toplama AÇIK. Her sahnede karardan önce ihtiyaç etiketini seç; üç sahne bitince oturum sayılır.'
            : 'Veri toplama KAPALI. Bu oyun kaydedilmez. Gönüllü verisi için kutuyu işaretleyip oyuna başla.'}
        </p>
        <p className="text-sm text-slate-300">Ad, e-posta, konum veya cihaz kimliği kaydedilmez. Rastgele oturum kimliği, oyun davranışı ve kendi ihtiyaç etiketin yalnız bu tarayıcıda saklanır. Her oturumda üç kararı tamamla. İstediğin zaman kayıtları silebilirsin.</p>
        <p data-cy="saved-count">Yerel karar sayısı: {savedRows}. CSV yalnız tamamlanan oturumları içerir.</p>
        <p data-cy="completed-sessions">Tamamlanmış oturum: {completedSessions} / 15{completedSessions >= 15 ? ' — eğitim için yeterli.' : ' — üç sahneyi bitiren her oyun bir oturumdur.'}</p>
        <button className="mr-4 underline" data-cy="export-csv" onClick={() => {
          const count = exportRows(); setCompletedSessions(completedSessionCount()); setSavedRows(getRows().length);
          setCollectionMessage(count > 0
            ? `${count} tamamlanmış oturum dışa aktarıldı.`
            : 'Henüz tamamlanmış oturum yok; üç sahne bitmeden CSV oluşmaz.');
        }}>CSV indir ({completedSessions})</button>
        <button className="underline" onClick={() => {
          clearRows(); setSavedRows(0); setCompletedSessions(0);
          setCollectionMessage('Yerel kayıtlar silindi.');
        }}>Kayıtları sil</button>
        <p>{collectionMessage}</p>
      </section>}
      {currentScreen === 'crisis' && <section className="mx-auto w-full max-w-7xl px-4 py-2 text-sm" aria-live="polite">
        {prediction?.status === 'synthetic-demo' && <p className="text-amber-300">Sentetik demo modeli — gerçek kullanıcı başarımı ölçülmedi.</p>}
        {prediction && !collectionMode && <output data-cy="live-p" className="block text-slate-300">İpucu ihtiyacı tahmini: %{(prediction.p * 100).toFixed(1)}</output>}
        {sessionId && <p data-cy="collection-status" role="status" className={collectionMode ? 'text-emerald-300' : 'text-amber-300'}>
          {collectionMode
            ? `Kayıt açık — bu oturumda ${sessionDecisions}/3 karar kaydedildi · Tamamlanmış oturum: ${completedSessions}/15`
            : 'Kayıt kapalı — bu oyun CSV\'ye eklenmez. Kaydetmek için ana ekrana dön, kutuyu işaretle ve yeniden başla.'}
        </p>}
        {modelError && <p data-cy="model-status">{modelError}</p>}
        {intervention && <div data-cy="tutor-banner" className="border border-indigo-400 rounded-lg p-3 bg-indigo-950">
          <strong>Dikkat: Bu adım kritik görünüyor — kriz freni</strong>
          <p>{userLevel === 'beginner' ? 'Birlikte küçük bir kontrol yapalım.' : 'Kısa bir teknik risk kontrolü yapalım.'} {[
            'Darboğaz sürerken yükü hangi bileşen güvenle bekletebilir?',
            'Aynı ödeme iki kez gelirse değişikliğin güvenli olduğunu nasıl kanıtlarsın?',
            'Bir log satırını paylaşmadan önce hangi alanların açığa çıktığını kontrol edersin?'
          ][currentStepIndex]}</p>
          {userLevel === 'experienced' && <p data-cy="timer-paused">Düşünmen için süre baskısı durduruldu.</p>}
        </div>}
        {collectionMode && !currentStepChoice && <div className="border border-slate-500 rounded-lg p-3 space-y-2">
          <p>Bu kararı vermeden önce yönlendirici bir ipucuna ihtiyacın var mı? Yanlış/doğru sonucuna göre cevaplama. Otomatik kriz freni veri toplarken kapalıdır.</p>
          <button data-cy="label-yes" className="mr-4 underline" onClick={() => { setLabel({ value: 1, features: [...features] as Features }); setCollectionMessage('İhtiyaç var etiketi seçildi.'); }}>Evet, ipucu gerekli</button>
          <button data-cy="label-no" className="underline" onClick={() => { setLabel({ value: 0, features: [...features] as Features }); setCollectionMessage('İhtiyaç yok etiketi seçildi.'); }}>Hayır, kendim ilerleyebilirim</button>
          <p role="status">{collectionMessage}</p>
        </div>}
      </section>}

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {currentScreen === 'onboarding' && (
          <OnboardingScreen onStart={handleStartSimulation} />
        )}

        {currentScreen === 'crisis' && currentScenario && (
          <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
            {/* Desktop 2-Column Layout / Mobile Stacked Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Decision Hub (7 cols on desktop) */}
              <div className="lg:col-span-7 space-y-4">
                <DecisionHub
                  currentScenario={currentScenario}
                  userLevel={userLevel}
                  onMakeChoice={handleMakeChoice}
                  isProcessing={isProcessing}
                  selectedChoice={currentStepChoice}
                  onProceedNext={handleProceedNext}
                  isLastStep={currentStepIndex === CRISIS_SCENARIOS.length - 1}
                />
              </div>

              {/* Right Column: Live Incident Terminal & Telemetry (5 cols on desktop) */}
              <div className="lg:col-span-5 space-y-4">
                <IncidentTerminal
                  logs={incidentLogs}
                  highlightSeverity={currentScenario.sevLevel === 'SEV-1'}
                />

                {/* Tactical Incident Status Helper */}
                <div className="rounded-[8px] border border-[#1F2937] bg-[#111827] p-3 text-xs font-mono text-[#9CA3AF]">
                  <div className="flex items-center justify-between border-b border-[#1F2937] pb-1.5 mb-2">
                    <span className="text-[#F9FAFB] font-bold">KONSOL DURUMU:</span>
                    <span className="text-[#10B981]">[TELEMETRİ AKTİF]</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Sistem durumu: <span className="text-[#EF4444]">Muhteşem Cuma Kriz Odası</span>. 
                    Seçtiğiniz her müdahale kararı anında yukarıdaki olay terminaline ve servis telemetrisine yansır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'result' && (
          <>
            <p data-cy="session-saved" role="status" className={collectionMode && sessionDecisions === 3 ? 'mx-auto max-w-3xl px-4 pt-4 text-sm text-emerald-300' : 'mx-auto max-w-3xl px-4 pt-4 text-sm text-amber-300'}>
              {collectionMode
                ? sessionDecisions === 3
                  ? `Bu oturum kaydedildi (3/3). Tamamlanmış oturum: ${completedSessions}/15. CSV için ana ekrana dön.`
                  : `Bu oturum eksik (${sessionDecisions}/3); CSV'ye eklenmez. Üç sahneyi de etiketleyerek bitir.`
                : 'Bu oyun kaydedilmedi (veri toplama kapalı). Kaydetmek için ana ekranda kutuyu işaretleyip yeniden başla.'}
            </p>
            <PostMortemScreen
              outcome={evaluateOutcome()}
              decisions={decisionRecords}
              userLevel={userLevel}
              onRestart={handleRestart}
            />
          </>
        )}
      </main>

      {/* Bottom Sticky Socratic AI Tutor (Socrates Core) */}
      <SocratesWidget
        autoOpen={intervention}
        onHint={() => setHintCount(count => count + 1)}
        currentStepId={currentScenario ? currentScenario.id : 'step1'}
        userLevel={userLevel}
        selectedChoices={selectedChoices}
      />
    </div>
  );
}

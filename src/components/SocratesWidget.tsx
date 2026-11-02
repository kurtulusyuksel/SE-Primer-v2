import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, ChevronUp, ChevronDown, MessageSquare, HelpCircle, Loader2 } from 'lucide-react';
import { ChatMessage, StepId, UserLevel } from '../types/simulation';
import { soundManager } from '../utils/audio';

interface SocratesWidgetProps {
  autoOpen?: boolean;
  onHint?: () => void;
  currentStepId: StepId;
  userLevel: UserLevel;
  selectedChoices: { step1?: string; step2?: string; step3?: string };
}

export const SocratesWidget: React.FC<SocratesWidgetProps> = ({
  autoOpen = false,
  onHint,
  currentStepId,
  userLevel,
  selectedChoices,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (autoOpen) setIsOpen(true); }, [autoOpen, currentStepId]);

  // Initial greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'socrates',
      text: 'Muhteşem Cuma kriz odasındasın. Ben Socrates Core, baş mimari mentörünüm. Kararlarında sana doğrudan şık veya hazır cevap vermem; fakat doğru mimari ve güvenlik analizini yapabilmen için seni Sokratik sorularla düşündürürüm. Kafana takılan bir nokta var mı?',
      timestamp: '00:00:15',
      isSocraticQuestion: true,
    },
  ]);

  // Contextual quick questions per step (including explicit AC-5 test button)
  const getQuickPrompts = () => {
    const base = [
      'Hangi şıkkı seçmeliyim?', // AC-5 acceptance test prompt!
      'Cevap ne?', // AC-5 acceptance test prompt!
    ];

    if (currentStepId === 'step1') {
      return [...base, 'Asenkron kuyruğa geçmenin riski ne?', 'Monoliti restart etsek ne olur?'];
    }
    if (currentStepId === 'step2') {
      return [...base, 'Kriz anında testleri atlasak ne kaybederiz?', 'Çift çekim (double charge) nasıl engellenir?'];
    }
    return [...base, 'Hızlı debug için açık log atılamaz mı?', 'PCI-DSS Req 3.4 neden taviz vermez?'];
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    onHint?.();
    soundManager.playClick();

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          step: currentStepId,
          userLevel,
          choices: selectedChoices,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || 'Darboğazın kök nedenini analiz ederken, sence hangi metrik bize en gerçekçi resmi sunuyor?';

      const tutorMsg: ChatMessage = {
        id: `s-${Date.now()}`,
        sender: 'socrates',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        isSocraticQuestion: true,
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.warn('Tutor fetch error:', err);
      // Resilient fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `s-${Date.now()}`,
          sender: 'socrates',
          text: 'Doğrudan bir seçenek işaretlemek yerine şu soruyu düşün: Veritabanı bağlantı havuzu kilitlendiğinde yükü hafızada mı bekletmeliyiz, yoksa dayanıklı bir message broker üzerine mi almalıyız?',
          timestamp: '00:00:20',
          isSocraticQuestion: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky bottom-0 z-30 w-full border-t border-[#1F2937] bg-[#0A0F1D]/95 backdrop-blur-xl transition-all duration-300">
      {/* Header / Toggle Bar */}
      <div
        onClick={() => {
          if (!isOpen) onHint?.();
          setIsOpen(!isOpen);
          soundManager.playClick();
        }}
        className="flex cursor-pointer items-center justify-between bg-[#111827] px-4 py-2 hover:bg-[#151C2C] transition"
      >
        <div className="flex items-center space-x-2.5">
          {/* Pulsing Assistant Orb Indicator */}
          <div className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute h-full w-full rounded-full bg-[#6366F1] opacity-75 animate-ping" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-[#6366F1]" />
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold tracking-wider text-[#F9FAFB]">
              SOKRATİK AI MENTOR
            </span>
            <span className="rounded-[4px] border border-[#6366F1]/40 bg-[#6366F1]/15 px-1.5 py-0.2 font-mono text-[10px] text-[#C0C1FF]">
              SOCRATES CORE
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-[#9CA3AF]">
          <span className="hidden sm:inline font-mono text-[11px]">
            {isOpen ? '[Pencereyi Küçült]' : '[Sokratik Danışmanı Aç]'}
          </span>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </div>

      {/* Expandable Chat Body */}
      {isOpen && (
        <div className="mx-auto flex max-w-7xl flex-col p-3 sm:p-4">
          {/* Messages Area */}
          <div className="max-h-48 min-h-[120px] overflow-y-auto space-y-2.5 pr-1 font-mono text-xs sm:max-h-56">
            {messages.map((m) => {
              const isSocrates = m.sender === 'socrates';
              return (
                <div
                  key={m.id}
                  className={`flex ${isSocrates ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-[6px] p-2.5 leading-relaxed ${
                      isSocrates
                        ? 'border border-[#6366F1]/40 bg-[#111827]/90 text-[#E0E7FF] shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                        : 'border border-[#1F2937] bg-[#1E293B] text-[#F8FAFC]'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between text-[10px] text-[#9CA3AF]">
                      <span className="font-bold text-[#6366F1]">
                        {isSocrates ? '⚡ SOCRATES CORE' : '👤 SEN (MÜHENDİS)'}
                      </span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p className="font-sans text-xs sm:text-[13px]">{m.text}</p>
                    {isSocrates && m.isSocraticQuestion && (
                      <div className="mt-1.5 flex items-center space-x-1 font-mono text-[10px] text-[#A5B4FC]">
                        <Sparkles className="h-3 w-3 text-[#6366F1]" />
                        <span>Sokratik Yönlendirme: Doğrudan cevap verilmez; düşünce tetiklenir.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2 rounded-[6px] border border-[#6366F1]/40 bg-[#111827] px-3 py-2 text-xs text-[#A5B4FC]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#6366F1]" />
                  <span>Socrates Core telemetriyi analiz ediyor ve soruyu hazırlıyor...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (Mobile Friendly Buttons) */}
          <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto pb-1.5">
            <span className="shrink-0 font-mono text-[10px] uppercase text-[#6B7280]">
              Hızlı Sorular:
            </span>
            {getQuickPrompts().map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="shrink-0 rounded-[4px] border border-[#1F2937] bg-[#111827] px-2.5 py-1 font-mono text-[11px] text-[#9CA3AF] transition hover:border-[#6366F1] hover:text-[#F9FAFB] active:scale-95 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="mt-2 flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#6B7280]">
                kriz-komuta $
              </span>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Mentöre soru sor (örn: 'Hangi şıkkı seçmeliyim?', 'Kuyruğun riski ne?')..."
                className="w-full rounded-[4px] border border-[#374151] bg-[#0A0F1D] py-2 pl-28 pr-3 font-mono text-xs text-[#F9FAFB] placeholder-[#4B5563] transition focus:border-[#6366F1] focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="flex items-center space-x-1.5 rounded-[4px] bg-[#6366F1] px-4 py-2 font-mono text-xs font-bold text-white transition hover:bg-[#4F46E5] active:scale-95 disabled:opacity-40"
            >
              <span>SOR</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

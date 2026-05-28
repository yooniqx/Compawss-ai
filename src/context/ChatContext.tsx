import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRescue } from './RescueContext';
import { safeInsertSupabaseRecord } from '../services/supabaseClient';
import { BACKEND_URL, updateBackendStatus } from '../services/aiService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string; // ISO string
  isDemo?: boolean;
}

export interface ChatThread {
  id: string; // 'general' | 'case' | 'scan' | 'coord'
  name: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

interface ChatContextType {
  activeThreadId: string;
  setActiveThreadId: (id: string) => void;
  threads: Record<string, ChatThread>;
  messages: ChatMessage[];
  loading: boolean;
  attachContext: boolean;
  setAttachContext: (val: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: (threadId?: string) => void;
  newThread: (threadId?: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const THREAD_METADATA = {
  general: {
    name: 'General Co-Pilot',
    welcome: 'Hello! I am your Compawss AI Rescue Co-pilot. I am here to help you report, coordinate, and track rescues of injured, lost, or vulnerable animals safely.\n\nType a question or select a quick action to begin coordination.',
  },
  case: {
    name: 'Active Rescue Case Feed',
    welcome: 'Compawss Case Overwatch desk active. Ask me about ongoing citizen reports, responder assignments, or timeline tracking. I can suggest medical triage priority codes based on status data.',
  },
  scan: {
    name: 'Vision Scan Diagnosis',
    welcome: 'Compawss Computer Vision desk active. Ready to analyze species pathology, visible laceration severity, first aid recommendations, and contraindications. Touch "Attach Trauma Report" to feed current camera telemetry.',
  },
  coord: {
    name: 'NGO & Team Dispatch Desk',
    welcome: 'Logistics Dispatch Desk active. Ready to help coordinate verified volunteer cells, standby ambulance allocations, and NGO transport dispatch lanes near active emergency zones.',
  },
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { vets, ngos, userLocation, cases } = useRescue();
  const [activeThreadId, setActiveThreadId] = useState<string>('general');
  const [loading, setLoading] = useState(false);
  const [attachContext, setAttachContext] = useState(true);

  // Load threads from localStorage or set initial state
  const [threads, setThreads] = useState<Record<string, ChatThread>>(() => {
    const backup = localStorage.getItem('compawss_chat_threads');
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        // Ensure all required threads exist in backup, otherwise backfill
        const keys = ['general', 'case', 'scan', 'coord'];
        let updated = { ...parsed };
        let modified = false;
        keys.forEach((k) => {
          if (!updated[k]) {
            const meta = THREAD_METADATA[k as keyof typeof THREAD_METADATA];
            updated[k] = {
              id: k,
              name: meta.name,
              messages: [
                {
                  id: `welcome-${k}-${Date.now()}`,
                  sender: 'ai',
                  text: meta.welcome,
                  timestamp: new Date().toISOString(),
                }
              ],
              lastUpdated: new Date().toISOString(),
            };
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem('compawss_chat_threads', JSON.stringify(updated));
        }
        return updated;
      } catch (err) {
        console.warn("Retrying chat threads JSON parse failure:", err);
      }
    }

    // Default initialization
    const initial: Record<string, ChatThread> = {};
    Object.entries(THREAD_METADATA).forEach(([key, meta]) => {
      initial[key] = {
        id: key,
        name: meta.name,
        messages: [
          {
            id: `welcome-${key}-${Date.now()}`,
            sender: 'ai',
            text: meta.welcome,
            timestamp: new Date().toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
      };
    });
    localStorage.setItem('compawss_chat_threads', JSON.stringify(initial));
    return initial;
  });

  const activeThread = threads[activeThreadId] || threads['general'];
  const messages = activeThread.messages;

  // Persist to localStorage on threads state change
  useEffect(() => {
    localStorage.setItem('compawss_chat_threads', JSON.stringify(threads));
  }, [threads]);

  // Method to clear chat
  const clearChat = (threadId?: string) => {
    const tid = threadId || activeThreadId;
    const meta = THREAD_METADATA[tid as keyof typeof THREAD_METADATA];
    
    setThreads((prev) => ({
      ...prev,
      [tid]: {
        ...prev[tid],
        messages: [
          {
            id: `welcome-${tid}-${Date.now()}`,
            sender: 'ai',
            text: meta.welcome,
            timestamp: new Date().toISOString(),
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
    }));
  };

  // Method to force start a clean thread session
  const newThread = (threadId?: string) => {
    const tid = threadId || activeThreadId;
    clearChat(tid);
  };

  // Main sendMessage routine calling our Python AI backend POST /ai/chat
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    // 1. Immediately append user message to local state
    setThreads((prev) => {
      const targetThread = prev[activeThreadId] || prev['general'];
      return {
        ...prev,
        [activeThreadId]: {
          ...targetThread,
          messages: [...targetThread.messages, userMsg],
          lastUpdated: new Date().toISOString(),
        },
      };
    });

    setLoading(true);

    // 2. Compile dynamic context metadata
    let userLocationName = userLocation.name || 'Bandra, Mumbai';
    let vetsList = vets || [];
    let ngosList = ngos || [];
    
    // Pick active selected case if exists or default to first
    let activeCase = cases && cases.length > 0 ? cases[0] : undefined;
    
    // Read local storage draft if available to see if there's any active vision scan
    let scanExplanation = 'None';
    const activeDraftStr = localStorage.getItem('compawss_active_draft');
    if (activeDraftStr) {
      try {
        const draftObj = JSON.parse(activeDraftStr);
        if (draftObj) {
          scanExplanation = `Species: ${draftObj.presetId || 'stray'}. Notes: ${draftObj.notes || 'None'}. Tags: ${draftObj.tags?.join(', ') || 'None'}. Coordinates: ${draftObj.locationText || 'No custom landmark'}`;
        }
      } catch (e) {}
    }

    const compiledContext = attachContext ? {
      userLocationName,
      vetsList,
      ngosList,
      activeCase,
      scanExplanation,
      coordinationDetails: `System alerts: active alerts are broadcasted to nearby responders. Offline-mode is ${localStorage.getItem('compawss_offline_mode') === 'true' ? 'enabled' : 'disabled'}.`,
    } : undefined;

    // Send only the last 15 messages for history context safety
    const historyToPost = [...messages, userMsg].slice(-15).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    const payload = {
      messages: historyToPost,
      context: compiledContext,
      threadId: activeThreadId,
    };

    let aiResponseText = '';
    let isLiveResponse = false;

    // 3. Dispatch POST request to our FastAPI backend /ai/chat
    const requestUrl = `${BACKEND_URL}/ai/chat`;
    const requestStart = new Date().toISOString();
    console.log(`[ChatContext] [REQUEST START] URL: ${requestUrl} | Endpoint: /ai/chat | Start: ${requestStart}`);

    let responseStatus = 0;
    let rawJson: any = null;
    let fallbackReason = "";
    const startMs = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout for free-tier sleepers

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      responseStatus = response.status;
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        rawJson = data;
        aiResponseText = data.response;
        isLiveResponse = data.is_live;

        const duration = Date.now() - startMs;
        console.log(`[ChatContext] [REQUEST SUCCESS] URL: ${requestUrl} | Status: ${responseStatus} | Parsed JSON:`, data);
        updateBackendStatus({
          isLive: true,
          lastSuccessfulCall: new Date().toLocaleTimeString(),
          responseTimeMs: duration,
          mode: 'LIVE BACKEND'
        });
      } else {
        fallbackReason = `HTTP Error Code: ${response.status}`;
        try {
          rawJson = await response.json();
        } catch (_) {}
        console.warn(`[ChatContext] [REQUEST FAILED] FastAPI backend responded with failure. Status: ${responseStatus}. Fallback reason: ${fallbackReason}`);
      }
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError';
      fallbackReason = isTimeout ? "Timeout (20s reached)" : (err.message || "Network Error");
      console.warn(`[ChatContext] [REQUEST ERROR] Could not reach Chat Backend. Fallback reason: ${fallbackReason}. Error details:`, err);
    }

    if (!aiResponseText) {
      console.log(`[ChatContext] [REQUEST COMPLETED WITH FALLBACK] URL: ${requestUrl} | Status: ${responseStatus} | Parsed JSON:`, rawJson, `| Fallback trigger reason: ${fallbackReason}`);
    }

    // 4. Fallback default heuristics if FastAPI client is missing or offline, clearly labeled Demo AI
    if (!aiResponseText) {
      isLiveResponse = false;
      const lower = text.toLowerCase();
      // Emulate our custom python fallback logic exactly on the client side
      if (lower.includes('report') || lower.includes('injured') || lower.includes('distress')) {
        aiResponseText = `🚨 **EMERGENCY REPORT ANALYSIS & CO-PILOT TACTICS (DEMO AI - BACKEND OFFLINE)**\n\nLogged reported distress within **${userLocationName}** region. Prepare a cardboard platform, clean thermal blankets, and aseptic bandages immediately.\n\n💡 **TACTICAL STEPS:**\n1. **Contain Perimeter:** Keep children, pets, and crowds 3-5 meters back to avoid panicking the subject.\n2. **Emergency Responders:** Alert nearby NGO teams in your coordinate quadrant:\n${ngosList.slice(0, 2).map((n) => `• ${n.name} (${n.contact})`).join('\n')}\n\n⚠️ **CRITICAL CAUTION:** Avoid giving any water, liquids, or food orally if the animal is lethargic, weak, or shocked. Airway aspiration is highly fatal.`;
      } else if (lower.includes('vet') || lower.includes('clinic') || lower.includes('hospital')) {
        aiResponseText = `🏥 **VERIFIED EMERGENCY MEDICINE HUB (DEMO AI - BACKEND OFFLINE)**\n\nCoordinates scanning local animal clinics within ${userLocationName} grid quadrant:\n\n${vetsList.slice(0, 3).map((v) => `• **${v.clinicName}** (${v.name}) — Phone: ${v.contact} (${v.distance} away)`).join('\n')}\n\n👉 **Immediate Directives:** Place a call right now to confirm standard surgeon availability before transporting any fractured cases.`;
      } else if (lower.includes('ngo') || lower.includes('rescuer') || lower.includes('responder')) {
        aiResponseText = `🏢 **VERIFIED CO-PILOT NGO EMERGENCY SQUAD (DEMO AI - BACKEND OFFLINE)**\n\nSTANDBY NGO FIRST-RESPONDER LISTING:\n${ngosList.slice(0, 3).map((n) => `• **${n.name}** — Phone: ${n.contact}, Address: ${n.address}`).join('\n')}\n\nAssemble transport kit, transport cages, and thick handlers gloves post-haste.`;
      } else if (lower.includes('scan') || lower.includes('photo') || lower.includes('image')) {
        aiResponseText = `📸 **COMPUTER VISION TRIAGE RECOMMENDATION (DEMO AI - BACKEND OFFLINE)**\n\nAnomalies parsed: **${scanExplanation}**.\n\nTriage safety protocol: Wrap the thoracic structure with soft padding. Limit active pacing. Provide an environment isolated from intense street acoustics.`;
      } else {
        aiResponseText = `🤖 **COMPAWSS RESCUE OVERWATCH RESPONSE (DEMO AI - BACKEND OFFLINE)**\n\nStanding by as your active rescue co-pilot inside **${userLocationName}** sector.\n\n📍 **Active Node Context:**\n• Active Case: ${activeCase ? `CPW-${activeCase.id}` : 'None Pinned'}\n• Nearby Vets: ${vetsList.length} active clinics\n• Nearby NGOs: ${ngosList.length} local shelters\n\nAsk me how to manage deep laceration bleeding, capture stray felines, map nearby animal responders, or handle visual image scans.`;
      }
    }

    const aiMsgId = `msg-ai-${Date.now()}`;
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date().toISOString(),
      isDemo: !isLiveResponse,
    };

    // 5. Append AI responding message to state
    setThreads((prev) => {
      const targetThread = prev[activeThreadId] || prev['general'];
      return {
        ...prev,
        [activeThreadId]: {
          ...targetThread,
          messages: [...targetThread.messages, aiMsg],
          lastUpdated: new Date().toISOString(),
        },
      };
    });

    setLoading(false);

    // 6. Supabase Persistence if configured
    try {
      // Safely insert both user and AI logs in Supabase table "chat_messages" if available
      // Using arbitrary columns matching standard chat schemas
      await safeInsertSupabaseRecord('chat_messages', {
        thread_id: activeThreadId,
        message_id: userMsgId,
        sender: 'user',
        text: text,
        created_at: userMsg.timestamp,
      });
      await safeInsertSupabaseRecord('chat_messages', {
        thread_id: activeThreadId,
        message_id: aiMsgId,
        sender: 'ai',
        text: aiResponseText,
        created_at: aiMsg.timestamp,
        is_demo: !isLiveResponse,
      });
    } catch (e) {
      // Silently catch table-missing or other database connection exceptions
    }
  };

  return (
    <ChatContext.Provider
      value={{
        activeThreadId,
        setActiveThreadId,
        threads,
        messages,
        loading,
        attachContext,
        setAttachContext,
        sendMessage,
        clearChat,
        newThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used inside a ChatProvider');
  }
  return context;
};

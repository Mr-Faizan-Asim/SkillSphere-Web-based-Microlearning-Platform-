// avtarpage.jsx
import React, { useState, useRef, useEffect } from 'react';

const AvatarPage = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSentence, setCurrentSentence] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const utteranceRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const topicInputRef = useRef(null);
  const scriptRef = useRef([]);
  const avatarViewerRef = useRef(null);
  const avatarViewerInstanceRef = useRef(null);
  
  // Load Ready Player Me SDK
  useEffect(() => {
    // Focus on input
    setTimeout(() => {
      topicInputRef.current?.focus();
    }, 300);
    
    // Initialize Ready Player Me avatar viewer
    const initAvatarViewer = async () => {
      try {
        // Check if SDK is already loaded
        if (window.AvatarViewer) {
          createAvatarViewer();
        } else {
          // Load SDK dynamically
          const script = document.createElement('script');
          script.src = 'https://adyen.github.io/ready-player-me-sdk/ready-player-me.js';
          script.async = true;
          script.onload = createAvatarViewer;
          document.head.appendChild(script);
        }
      } catch (err) {
        console.error("Error initializing avatar viewer:", err);
        setError("Failed to load avatar system. Please check your connection.");
      }
    };
    
    const createAvatarViewer = () => {
      if (!window.AvatarViewer || avatarViewerInstanceRef.current) return;
      
      try {
        // Create a default avatar URL (you can customize this)
        const defaultAvatar = 'https://models.readyplayer.me/66d9b7d0b5a5c3b6d8e0e7a7.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSize=1024&format=glb';
        
        setAvatarUrl(defaultAvatar);
        
        // Initialize the viewer
        avatarViewerInstanceRef.current = new window.AvatarViewer(avatarViewerRef.current, {
          url: defaultAvatar,
          cameraInitialDistance: 1.2,
          cameraMinDistance: 0.8,
          cameraMaxDistance: 2.0,
          environment: 'studio',
          disableCameraControls: true,
          disableZoom: true,
          disableRotation: true
        });
        
        // Add mouth movement capabilities
        addMouthMovement();
      } catch (err) {
        console.error("Error creating avatar viewer:", err);
      }
    };
    
    // Add mouth movement animation based on speech
    const addMouthMovement = () => {
      if (!avatarViewerInstanceRef.current) return;
      
      // Create animation mixer for facial expressions
      const mixer = new THREE.AnimationMixer(avatarViewerInstanceRef.current.model);
      
      // Set up viseme animations (mouth shapes)
      const visemes = {
        'sil': { mouthOpen: 0, mouthSmile: 0 },
        'aa': { mouthOpen: 1, mouthSmile: 0 },
        'ih': { mouthOpen: 0.8, mouthSmile: 0.2 },
        'oh': { mouthOpen: 0.5, mouthSmile: 0.5 },
        'ee': { mouthOpen: 0.3, mouthSmile: 0.7 },
        'ou': { mouthOpen: 0.2, mouthSmile: 0.8 }
      };
      
      // Current viseme state
      let currentViseme = 'sil';
      let visemeProgress = 0;
      
      // Animation loop for smooth transitions
      const animate = () => {
        if (isSpeaking) {
          // Randomly cycle through visemes for natural speech
          visemeProgress += 0.05;
          
          if (visemeProgress > 1) {
            const visemeKeys = Object.keys(visemes);
            currentViseme = visemeKeys[Math.floor(Math.random() * visemeKeys.length)];
            visemeProgress = 0;
          }
          
          // Apply current viseme
          const viseme = visemes[currentViseme];
          if (avatarViewerInstanceRef.current) {
            avatarViewerInstanceRef.current.setMorphTarget('mouthOpen', viseme.mouthOpen);
            avatarViewerInstanceRef.current.setMorphTarget('mouthSmile', viseme.mouthSmile);
          }
        } else {
          // Reset to neutral expression
          avatarViewerInstanceRef.current.setMorphTarget('mouthOpen', 0);
          avatarViewerInstanceRef.current.setMorphTarget('mouthSmile', 0);
        }
        
        requestAnimationFrame(animate);
      };
      
      requestAnimationFrame(animate);
    };
    
    initAvatarViewer();
    
    // Cleanup
    return () => {
      if (avatarViewerInstanceRef.current) {
        avatarViewerInstanceRef.current.dispose();
        avatarViewerInstanceRef.current = null;
      }
      synthRef.current.cancel();
    };
  }, []);

  // Generate teaching script using Groq API
  const generateTeachingScript = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // WARNING: THIS IS INSECURE - API KEY IN FRONTEND
      // In production, use a backend proxy
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{
            role: 'system',
            content: 'You are a professional teacher who explains concepts clearly and engagingly. Keep responses concise (5-6 sentences). Structure lessons with: 1) Introduction 2) Key concepts 3) Real-world applications 4) Summary. Use simple language appropriate for beginners.'
          }, {
            role: 'user',
            content: `Create a teaching script about ${topic}. Use simple language and engaging examples.`
          }],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse Groq's response into teaching sentences
      const rawContent = data.choices?.[0]?.message?.content || 
        `I'm your AI tutor for ${topic}. Let's explore the key concepts together.`;
      
      // Split into logical sentences
      const sentences = rawContent
        .split(/(?<=[.!?])\s+/)
        .filter(s => s.length > 10)
        .map(s => s.trim().replace(/["']/g, ''))
        .slice(0, 8);
      
      // Add structured teaching flow
      const teachingScript = [
        `Hello! I'm your AI tutor. Today we'll explore ${topic}.`,
        ...sentences,
        `To summarize, the key points about ${topic} are these principles we've discussed.`,
        `That concludes our lesson on ${topic}. Feel free to ask for more details!`
      ];
      
      scriptRef.current = teachingScript;
      setIsGenerating(false);
      startTeaching();
    } catch (err) {
      console.error("Teaching generation error:", err);
      setError(
        "Failed to generate lesson. This is likely because the API key is invalid or exposed. " +
        "For security, API keys should NEVER be in frontend code. " +
        "Using fallback content instead."
      );
      
      // Fallback teaching script
      const fallbackScript = [
        `Hello! I'm your AI tutor for ${topic}.`,
        `Let's begin with the fundamental concepts of ${topic}.`,
        `This field encompasses several important principles and methodologies.`,
        `Experts in this area follow specific approaches to understand these concepts.`,
        `Practical applications of ${topic} can be found in various aspects of daily life.`,
        `Remember that mastering ${topic} will help you in related areas as well.`,
        `That concludes our lesson on ${topic}. Feel free to ask for more details!`
      ];
      
      scriptRef.current = fallbackScript;
      setIsGenerating(false);
      startTeaching();
    }
  };

  const speak = (text, index) => {
    if (!('speechSynthesis' in window)) {
      setError("Text-to-speech not supported. Please use Chrome or Edge.");
      setIsGenerating(false);
      return;
    }

    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSentence(text);
      setCurrentIndex(index);
    };
    
    utterance.onend = () => {
      if (index < scriptRef.current.length - 1) {
        setTimeout(() => speak(scriptRef.current[index + 1], index + 1), 300);
      } else {
        setIsSpeaking(false);
        setCurrentSentence("");
      }
    };
    
    utterance.onerror = (e) => {
      setError(`Speech error: ${e.error}`);
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const startTeaching = () => {
    setError(null);
    setCurrentIndex(0);
    if (scriptRef.current.length > 0) {
      speak(scriptRef.current[0], 0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && topic.trim()) {
      generateTeachingScript();
    }
  };

  return (
    <div className="font-sans max-w-4xl mx-auto p-6 bg-slate-50 rounded-2xl shadow-xl transition-all duration-300 ease-in-out">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-700 to-cyan-500 bg-clip-text text-transparent">
          AI Learning Avatar
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Enter any topic and get a personalized lesson from our AI tutor
        </p>
      </div>

      {/* Topic Input */}
      <div className="flex flex-col items-center gap-5 mb-10">
        <div className="flex w-full max-w-2xl">
          <input
            ref={topicInputRef}
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter any topic (e.g., 'quantum physics', 'Renaissance art', 'blockchain')"
            className="flex-1 p-4 text-base border-2 border-slate-300 rounded-l-xl focus:border-blue-500 focus:outline-none transition-colors"
          />
          <button 
            onClick={generateTeachingScript}
            disabled={isGenerating || !topic.trim()}
            className={`bg-${isGenerating ? 'slate-400' : 'blue-500'} text-white border-none px-6 py-4 rounded-r-xl cursor-${isGenerating || !topic.trim() ? 'not-allowed' : 'pointer'} text-base font-semibold transition-all`}
          >
            {isGenerating ? 'Thinking...' : 'Teach Me'}
          </button>
        </div>
        
        {error && (
          <div className="bg-rose-50 text-rose-700 p-4 rounded-xl w-full max-w-2xl text-left">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-8 relative">
        {/* Ready Player Me Avatar Container */}
        <div className="relative w-80 h-80 bg-white rounded-full overflow-hidden shadow-2xl border-2 border-white transition-transform duration-300">
          {/* Ready Player Me Viewer */}
          <div 
            ref={avatarViewerRef}
            className="w-full h-full"
            style={{ 
              borderRadius: '50%', 
              overflow: 'hidden',
              background: '#f0f0f0'
            }}
          >
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
                <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin mb-3"></div>
                <div className="text-sky-600 text-sm">Creating your avatar...</div>
              </div>
            )}
          </div>
          
          {/* Speech bubble */}
          {currentSentence && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 px-6 py-4 rounded-3xl max-w-[85%] shadow-md text-base leading-relaxed border border-slate-200 animate-fadeIn">
              {currentSentence}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <button 
            onClick={startTeaching}
            disabled={isSpeaking || isGenerating || scriptRef.current.length === 0}
            className={`bg-${isSpeaking || isGenerating ? 'slate-300' : 'blue-500'} text-white border-none px-6 py-3.5 rounded-xl cursor-${isSpeaking || isGenerating || scriptRef.current.length === 0 ? 'not-allowed' : 'pointer'} text-lg font-semibold transition-all shadow-md hover:${isSpeaking || isGenerating || scriptRef.current.length === 0 ? '' : 'translate-y-[-2px] shadow-lg'}`}
          >
            {isSpeaking ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span> Teaching...
              </span>
            ) : isGenerating ? (
              'Generating...'
            ) : scriptRef.current.length > 0 ? (
              'Replay Lesson'
            ) : (
              'Start Teaching'
            )}
          </button>
          
          <button 
            onClick={() => {
              synthRef.current.cancel();
              setIsSpeaking(false);
            }}
            className="bg-rose-500 text-white border-none px-6 py-3.5 rounded-xl cursor-pointer text-lg font-semibold transition-all shadow-md hover:translate-y-[-2px] shadow-lg"
          >
            Stop
          </button>
        </div>

        {/* Progress Indicators */}
        {scriptRef.current.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2.5 mt-2">
            {scriptRef.current.map((_, index) => (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full ${index === currentIndex ? 'bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.3)]' : 'bg-slate-300'} transition-all duration-300`}
              ></div>
            ))}
          </div>
        )}

        {/* Security Warning */}
        <div className="mt-10 p-6 bg-amber-50 rounded-2xl border border-amber-100 text-left w-full max-w-2xl">
          <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-3">
            <span className="bg-amber-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg">⚠️</span>
            Critical Security Notice
          </h3>
          
          <p className="text-amber-800 leading-relaxed mb-4">
            <strong>YOUR API KEYS HAVE BEEN EXPOSED!</strong> This is extremely dangerous.
          </p>
          
          <ul className="pl-6 list-disc text-amber-800 leading-relaxed mb-4">
            <li>Groq API key: <code>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</code></li>
            <li>Stripe API key: <code>sk_live_XsgtYnBhju9php1wMYhj3URu-24vmQIZFcpv</code></li>
          </ul>
          
          <p className="text-amber-800 leading-relaxed font-bold mb-2">
            You must immediately:
          </p>
          
          <ol className="pl-6 list-decimal text-amber-800 leading-relaxed">
            <li>Revoke both API keys in their respective dashboards</li>
            <li>Create new keys</li>
            <li>NEVER put API keys in frontend code</li>
            <li>Use a backend proxy server for API access</li>
          </ol>
          
          <div className="mt-4 p-4 bg-amber-100 rounded-lg text-amber-800">
            <strong>Note:</strong> Ready Player Me does NOT require an API key for basic embedding. 
            The Stripe key appears to be unrelated to this implementation.
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease forwards;
          }
        `}
      </style>
      
      {/* Ready Player Me SDK - This is required for the avatar to work */}
      <script
        src="https://adyen.github.io/ready-player-me-sdk/ready-player-me.js"
        async
      />
    </div>
  );
};

export default AvatarPage;
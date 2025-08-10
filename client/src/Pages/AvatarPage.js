// avtarpage.jsx
import React, { useState, useRef, useEffect } from 'react';

const AvatarPage = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSentence, setCurrentSentence] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState('');
  const [mouthHeight, setMouthHeight] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const utteranceRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const topicInputRef = useRef(null);
  const scriptRef = useRef([]);
  const animationFrameRef = useRef(null);
  const mouthAnimationRef = useRef(null);
  
  // Focus on input when component loads
  useEffect(() => {
    setTimeout(() => {
      topicInputRef.current?.focus();
    }, 300);
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (mouthAnimationRef.current) {
        cancelAnimationFrame(mouthAnimationRef.current);
      }
      synthRef.current.cancel();
    };
  }, []);

  // Generate teaching script using Groq API directly (INSECURE - FOR DEMO ONLY)
  const generateTeachingScript = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // WARNING: THIS IS INSECURE - API KEY IN FRONTEND
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

  // Realistic lip-syncing animation
  const animateMouth = () => {
    if (isSpeaking) {
      // Create a natural mouth movement pattern based on speech
      const time = Date.now() / 200; // Slow down the animation
      const mouthValue = 5 + 10 * Math.abs(Math.sin(time * 2));
      
      setMouthHeight(mouthValue);
      
      // Add subtle head movement for realism
      if (Math.random() > 0.95) {
        const headElement = document.querySelector('.avatar-head');
        if (headElement) {
          headElement.style.transform = 'rotate(' + (Math.random() * 2 - 1) + 'deg)';
          setTimeout(() => {
            if (headElement) {
              headElement.style.transform = 'rotate(0deg)';
            }
          }, 300);
        }
      }
    } else {
      setMouthHeight(5);
    }
    
    mouthAnimationRef.current = requestAnimationFrame(animateMouth);
  };

  useEffect(() => {
    mouthAnimationRef.current = requestAnimationFrame(animateMouth);
    return () => {
      if (mouthAnimationRef.current) {
        cancelAnimationFrame(mouthAnimationRef.current);
      }
    };
  }, [isSpeaking]);

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
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: '900px',
      margin: '0 auto',
      padding: '25px',
      backgroundColor: '#f8fafc',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '35px'
      }}>
        <h1 style={{ 
          color: '#1e293b',
          fontSize: '2.2rem',
          fontWeight: '700',
          marginBottom: '12px',
          background: 'linear-gradient(90deg, #1e40af, #0ea5e9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AI Learning Avatar
        </h1>
        <p style={{ 
          color: '#475569',
          fontSize: '1.1rem',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Enter any topic and get a personalized lesson from our AI tutor
        </p>
      </div>

      {/* Topic Input */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '35px'
      }}>
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: '600px'
        }}>
          <input
            ref={topicInputRef}
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter any topic (e.g., 'quantum physics', 'Renaissance art', 'blockchain')"
            style={{
              flex: 1,
              padding: '16px 20px',
              fontSize: '16px',
              border: '2px solid #cbd5e1',
              borderTopLeftRadius: '12px',
              borderBottomLeftRadius: '12px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />
          <button 
            onClick={generateTeachingScript}
            disabled={isGenerating || !topic.trim()}
            style={{
              backgroundColor: isGenerating ? '#94a3b8' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '0 25px',
              borderTopRightRadius: '12px',
              borderBottomRightRadius: '12px',
              cursor: isGenerating || !topic.trim() ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            {isGenerating ? 'Thinking...' : 'Teach Me'}
          </button>
        </div>
        
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '12px 20px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '30px',
        position: 'relative'
      }}>
        {/* Real Avatar Container - SVG-based with advanced animation */}
        <div style={{ 
          position: 'relative',
          width: '320px',
          height: '320px',
          backgroundColor: 'white',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '6px solid white',
          transition: 'transform 0.3s ease'
        }}>
          {/* SVG Avatar with realistic animated mouth */}
          <svg 
            viewBox="0 0 300 300" 
            style={{ 
              width: '100%', 
              height: '100%',
              background: 'white',
              borderRadius: '50%'
            }}
          >
            {/* Head with subtle shadow */}
            <defs>
              <radialGradient id="skinGradient" cx="0.5" cy="0.3" r="0.8">
                <stop offset="0%" stopColor="#FCD9C1" />
                <stop offset="100%" stopColor="#F9D7C0" />
              </radialGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="1" dy="2" result="offsetblur" />
                <feFlood floodColor="rgba(0,0,0,0.1)" />
                <feComposite in2="offsetblur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Head with gradient */}
            <circle cx="150" cy="150" r="100" fill="url(#skinGradient)" filter="url(#shadow)" />
            
            {/* Hair with natural shape */}
            <path d="M75,125 C75,85 150,65 225,85 C225,125 195,145 150,145 C105,145 75,125 75,125" fill="#5C4033" />
            
            {/* Eyes with realistic details */}
            <circle cx="120" cy="135" r="12" fill="white" />
            <circle cx="180" cy="135" r="12" fill="white" />
            <circle cx="125" cy="135" r="6" fill="#333" />
            <circle cx="185" cy="135" r="6" fill="#333" />
            <circle cx="127" cy="132" r="2" fill="white" /> {/* Eye highlight */}
            <circle cx="187" cy="132" r="2" fill="white" />
            
            {/* Eyebrows with natural arch */}
            <path d="M100,110 C110,105 140,105 150,110" 
                  stroke="#5C4033" stroke-width="4" fill="none" />
            <path d="M150,110 C160,105 190,105 200,110" 
                  stroke="#5C4033" stroke-width="4" fill="none" />
            
            {/* Nose with subtle detail */}
            <path d="M150,145 L155,160" 
                  stroke="#E5C5AE" stroke-width="2" fill="none" />
            
            {/* Mouth - animated with realistic movement */}
            <path d={`M120,${180 - mouthHeight} C135,${190 - mouthHeight/2} 165,${190 - mouthHeight/2} 180,${180 - mouthHeight}`} 
                  stroke="#E57373" stroke-width="3" fill="none" />
            
            {/* Teeth for when mouth is open */}
            {mouthHeight > 10 && (
              <path d={`M135,${175 - mouthHeight/2} C150,${180 - mouthHeight/2} 150,${180 - mouthHeight/2} 165,${175 - mouthHeight/2}`} 
                    fill="white" />
            )}
            
            {/* Blush for more life when speaking */}
            {isSpeaking && (
              <>
                <ellipse cx="95" cy="165" rx="15" ry="8" fill="rgba(255, 150, 150, 0.2)" />
                <ellipse cx="205" cy="165" rx="15" ry="8" fill="rgba(255, 150, 150, 0.2)" />
              </>
            )}
          </svg>
          
          {/* Speech bubble with typing animation */}
          {currentSentence && (
            <div style={{
              position: 'absolute',
              bottom: '25px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '15px 25px',
              borderRadius: '25px',
              maxWidth: '85%',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              fontSize: '16px',
              lineHeight: '1.5',
              border: '1px solid #e2e8f0',
              animation: 'fadeIn 0.3s ease'
            }}>
              {currentSentence}
            </div>
          )}
          
          {/* Thinking indicator */}
          {isGenerating && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #dbeafe',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px'
              }}></div>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                color: '#3b82f6',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}>
                Creating lesson...
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '18px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '10px'
        }}>
          <button 
            onClick={startTeaching}
            disabled={isSpeaking || isGenerating || scriptRef.current.length === 0}
            style={{
              backgroundColor: isSpeaking || isGenerating ? '#cbd5e1' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              cursor: isSpeaking || isGenerating || scriptRef.current.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '17px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSpeaking ? (
              <>
                <span style={{ 
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  animation: 'pulse 1.5s infinite'
                }}></span> Teaching...
              </>
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
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '14px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '17px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            Stop
          </button>
        </div>

        {/* Progress Indicators */}
        {scriptRef.current.length > 0 && (
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            marginTop: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {scriptRef.current.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: index === currentIndex ? '#3b82f6' : '#cbd5e1',
                  transition: 'all 0.3s ease',
                  boxShadow: index === currentIndex ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              />
            ))}
          </div>
        )}

      </div>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.2); }
            100% { opacity: 1; transform: scale(1); }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(59, 130, 246, 0.35);
          }
          
          button:active:not(:disabled) {
            transform: translateY(0);
          }
          
          .avatar-speaking {
            filter: brightness(1.05);
          }
          
          .avatar-container {
            transition: all 0.3s ease;
          }
        `}
      </style>
    </div>
  );
};

export default AvatarPage;
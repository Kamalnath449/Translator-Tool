async function translateText() {
    const sourceText = document.getElementById('sourceText').value;
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    
    if (!sourceText) return;

    try {
        const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`
        );
        
        const data = await response.json();
        document.getElementById('targetText').value = data.responseData.translatedText || 'Translation not available';
    } catch (error) {
        console.error('Translation error:', error);
        document.getElementById('targetText').value = 'Translation error occurred';
    }
}

function switchLanguages() {
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    
    // Swap language selections
    [sourceLang.value, targetLang.value] = [targetLang.value, sourceLang.value];
    
    // Swap text content
    [sourceText.value, targetText.value] = [targetText.value, sourceText.value];
}

let recognition;
let isListening = false;

function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            isListening = true;
            document.querySelector('.speech-recognition-btn').classList.add('listening');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('sourceText').value += ' ' + transcript;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            alert('Speech recognition error: ' + event.error);
        };

        recognition.onend = () => {
            isListening = false;
            document.querySelector('.speech-recognition-btn').classList.remove('listening');
        };
    } else {
        console.warn('Speech recognition not supported in this browser');
        document.querySelector('.speech-recognition-btn').disabled = true;
    }
}

function startSpeechRecognition() {
    if (!recognition) {
        alert('Speech recognition not supported in your browser');
        return;
    }

    if (isListening) {
        recognition.stop();
        return;
    }

    // Set recognition language based on source language
    const sourceLang = document.getElementById('sourceLang').value;
    recognition.lang = getRecognitionLangCode(sourceLang);
    
    try {
        recognition.start();
    } catch (error) {
        console.error('Speech recognition start failed:', error);
    }
}

function getRecognitionLangCode(lang) {
    const codeMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'kn': 'kn-IN',
        'ml': 'ml-IN',
        'ru': 'ru-RU',
        'ar': 'ar-SA',
        // Add more mappings as needed
    };
    return codeMap[lang] || lang;
}

// Initialize speech recognition when page loads
window.onload = initializeSpeechRecognition;

function speakText(type) {
const text = type === 'source' 
    ? document.getElementById('sourceText').value
    : document.getElementById('targetText').value;

const lang = type === 'source'
    ? document.getElementById('sourceLang').value
    : document.getElementById('targetLang').value;

if (!text) return;

const utterance = new SpeechSynthesisUtterance();
utterance.text = text;
utterance.lang = getSpeechLangCode(lang);

// Get available voices
const voices = speechSynthesis.getVoices();

// Find voice with exact match first, then partial match
const voice = voices.find(v => v.lang === utterance.lang) ||
             voices.find(v => v.lang.startsWith(lang)) ||
             voices.find(v => v.lang.includes('IN')); // Fallback to Indian English

if (voice) {
    utterance.voice = voice;
    speechSynthesis.speak(utterance);
} else {
    alert(`Speech not available for ${lang}. Install voices in system settings.`);
    console.log('Available voices:', voices);
}
}

// Enhanced language code mapping
function getSpeechLangCode(lang) {
const codeMap = {
    'en': 'en-IN',  // Indian English
    'ta': 'ta-IN',  // Tamil
    'ml': 'ml-IN',  // Malayalam
    'te': 'te-IN', // Telugu
    'kn': 'kn-IN', // Kannada
    'hi': 'hi-IN', // Hindi
    'fr': 'fr-FR',
    'es': 'es-ES',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'zh': 'zh-CN'
};
return codeMap[lang] || lang;
}

// Initialize voices properly
let voices = [];
speechSynthesis.onvoiceschanged = () => {
voices = speechSynthesis.getVoices();
console.log('Available voices:', voices);
};

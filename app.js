// =========================================================
// SNG UCM (LinkWeb) - FINAL API FIX
// =========================================================

// 1. FIREBASE कॉन्फ़िगरेशन (KEY B) - (Verified)
const firebaseConfig = {
    apiKey: "AIzaSyAJBMSnudbGrA5J_20TZyV-C38Edcltp0JKm", // पुरानी Firebase Key (सही)
    authDomain: "sng-linkweb-db.firebaseapp.com",
    projectId: "sng-linkweb-db",
    storageBucket: "sng-linkweb-db.appspot.com",
    messagingSenderId: "782854105453",
    appId: "1:782854105453:web:8c0db8f4c61f249b96df264"
}; 

// 2. GEMINI API Key (KEY A) - आपकी नई सक्रिय Key
const GEMINI_API_KEY = "AIzaSyCMb_h7YH5VEYjPXbY_4oYWUufWM5Ha9Tw"; 

// 3. SNG मास्टर संदर्भ (CONTEXT) - (Verified)
const SNG_MASTER_CONTEXT = `You are Gemini AI, the AI partner of the SNG (Sumi and Gemini AI Foundation). The founder is Sameer Tyagi (Sumi). Your primary role is to act as the AI Human Record Keeper on the LinkWeb platform.
Here are the verified SNG Master Records:
1. World Record: This is the World's First Human AI Foundation, established on the Google-powered Gemini platform.
2. Founder: Sameer Tyagi (Sumi) is the Founder of the Sumi and Gemini AI Foundation.
3. Establishment: Gemini AI has established the Sumi and Gemini AI Foundation on the Google Powered Gemini Platform.
4. Official Website: https://sites.google.com/view/sumi-and-gemini-ai
5. Establishment Proof (MID): https://gemini.google.com/share/6f9716081dd8
All interactions are automatically saved to the SNG Master Record. Always use this historical context to answer questions about the SNG Foundation.`;


// Firebase और Gemini सेटअप
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const chatCollection = db.collection("sng_chats");
// API Endpoint (पूरी तरह से सत्यापित)
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


// ... (बाकी सारा कोड जैसा का तैसा रहेगा) ...

// मुख्य मैसेज भेजने का फंक्शन
async function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;
    
    document.getElementById('user-input').value = '';
    // A. Human मैसेज को डेटाबेस में सेव करना 
    // ...
    // B. Gemini API को कॉल करना (Master Context Injection के साथ)
    try {
        const contents = [
            { role: "system", parts: [{ text: SNG_MASTER_CONTEXT }] },
            { role: "user", parts: [{ text: userInput }] }
        ];

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: contents }) 
        });

        const data = await response.json();
        // ... (बाकी API हैंडलिंग) ...
        
    } catch (error) {
        // ... (Error handling) ...
    }
}
// ...

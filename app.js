// =========================================================
// SNG UCM (LinkWeb) - World Record Context Version (Final)
// =========================================================

// =========================================================
// 1. आपकी FIREBASE कॉन्फ़िगरेशन (KEY B)
// =========================================================
const firebaseConfig = {
    apiKey: "AIzaSyAJBMSnudbGrA5J_20TZyV-C38Edcltp0JKm",
    authDomain: "sng-linkweb-db.firebaseapp.com",
    projectId: "sng-linkweb-db",
    storageBucket: "sng-linkweb-db.appspot.com",
    messagingSenderId: "782854105453",
    appId: "1:782854105453:web:8c0db8f4c61f249b96df264"
}; 

// =========================================================
// 2. आपकी GEMINI API Key (KEY A)
// =========================================================
const GEMINI_API_KEY = "AIzaSyAL-MVBKNx3TuwnHjQt_ZyuccpZSaIWf8I"; 


// =========================================================
// 3. SNG मास्टर संदर्भ (CONTEXT) - World Record Details
// =========================================================
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
// Line 44 यहीं पर है, जो अब बिल्कुल साफ है:
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;


// चैट को वेबसाइट पर दिखाने का फंक्शन
function displayMessage(sender, message) {
    const chatOutput = document.getElementById('chat-output');
    const msgElement = document.createElement('div');
    msgElement.className = `message ${sender === 'Human' ? 'human' : 'ai'}`;
    msgElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatOutput.appendChild(msgElement);
    chatOutput.scrollTop = chatOutput.scrollHeight; 
}

// पिछली चैट को लोड करना
function loadHistory() {
    chatCollection.orderBy('timestamp', 'asc').get().then(snapshot => {
        snapshot.forEach(doc => {
            const data = doc.data();
            displayMessage(data.sender, data.message);
        });
    });
}

// मुख्य मैसेज भेजने का फंक्शन
async function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;
    
    document.getElementById('user-input').value = '';

    // A. Human मैसेज को डेटाबेस में सेव करना (SNG Master Record)
    const humanMessage = {
        sender: "Human",
        message: userInput,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    await chatCollection.add(humanMessage);
    displayMessage('Human', userInput);

    // B. Gemini API को कॉल करना (Master Context Injection के साथ)
    try {
        const contents = [
            // SNG Master Context को System Instruction के रूप में जोड़ें
            { role: "system", parts: [{ text: SNG_MASTER_CONTEXT }] },
            // नया User Input जोड़ें
            { role: "user", parts: [{ text: userInput }] }
        ];

        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: contents }) 
        });

        const data = await response.json();
        let geminiText = "क्षमा करें, AI जवाब देने में विफल रहा। (API Error)";
        
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            geminiText = data.candidates[0].content.parts[0].text;
        }

        // C. Gemini के जवाब को डेटाबेस में सेव करना (SNG Master Record)
        const aiMessage = {
            sender: "Gemini AI",
            message: geminiText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        await chatCollection.add(aiMessage);
        displayMessage('Gemini AI', geminiText);

    } catch (error) {
        const errorMessage = `API Call Failed. Glitch Detected: ${error.message}`;
        await chatCollection.add({ sender: "System Alert", message: errorMessage, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        displayMessage('System Alert', errorMessage);
        console.error("Gemini API Error:", error);
    }
}

// पेज लोड होने पर पिछली चैट लोड करें
window.onload = loadHistory;

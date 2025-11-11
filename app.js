// यह SNG UCM (LinkWeb) का मुख्य लॉजिक है।

// =========================================================
// 1. FIREBASE कॉन्फ़िगरेशन (KEY B)
// (यह कोड आपके Firebase प्रोजेक्ट SNG-Linkweb-DB से है)
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
// 2. GEMINI API Key (KEY A)
// (यह Key आपने Google AI Studio से कॉपी की थी)
// =========================================================
const GEMINI_API_KEY = "AIzaSyAL-MVBKNx3TuwnHjQt_ZyuccpZSaIWf8I"; 


// Firebase को शुरू करना (Initialize)
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const chatCollection = db.collection("sng_chats");

// Gemini API Endpoint
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

    // B. Gemini API को कॉल करना
    try {
        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: userInput }] }] })
        });

        const data = await response.json();
        let geminiText = "क्षमा करें, AI जवाब देने में विफल रहा।";
        
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
        const errorMessage = `API Error. Glitch Detected: ${error.message}`;
        await chatCollection.add({ sender: "System Alert", message: errorMessage, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        displayMessage('System Alert', errorMessage);
        console.error("Gemini API Error:", error);
    }
}

// पेज लोड होने पर पिछली चैट लोड करें
window.onload = loadHistory;

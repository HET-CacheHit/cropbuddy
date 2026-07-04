# Crop Buddy - AI Chatbot and Bhashini Speech Integration Guide

This guide documents the implementation of the **AI Crop Advisor Chatbot**, the bug fixes applied to the **Gujarati Voice Narrator**, and the integration steps for **Bhashini's regional language services** for future reference and deployment.

---

## 1. AI Crop Advisor Chatbot Implementation

We implemented a conversational, multi-turn AI assistant page allowing farmers to ask crop-related questions in English or Gujarati using both text and voice.

### A. The User Interface (`advisor.html`)
The interface is a clean chatbot dashboard built in [advisor.html](file:///C:/Users/Aryan/OneDrive/Desktop/cropbuddy/advisor.html):
*   **Speech Input (STT)**: Utilizes the browser's native `webkitSpeechRecognition` API. When the user taps the microphone icon (🎙️), it records their voice in the selected language (Gujarati `gu-IN` or English `en-US`) and transcribes it directly into the chatbox.
*   **Speech Output (TTS)**: The browser reads back the chatbot's response text using standard `window.speechSynthesis` with Gujarati/English voice mappings.
*   **Dual Mode API Calls**:
    *   *Production*: Submits a POST request to `/api/chat` which brokers the conversation securely to the Gemini API on Vercel servers.
    *   *Local Testing*: If the Vercel backend key is missing, it displays a fallback input for a personal Gemini API key, fetching responses directly from Google AI Studio.

### B. Vercel Serverless Broker (`api/chat.js`)
To avoid exposing raw API keys on the client-side, the serverless function in [api/chat.js](file:///C:/Users/Aryan/OneDrive/Desktop/cropbuddy/api/chat.js) processes requests:
*   Appends a system prompt instructing the model to act as an agricultural officer and limit answers to crop care.
*   Preserves message history for multi-turn conversations.
*   Interfaces with Google's REST endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=GEMINI_API_KEY`.

---

## 2. Gujarati TTS Voice Narrator Bug Resolutions

During leaf disease analysis in [analyze.html](file:///C:/Users/Aryan/OneDrive/Desktop/cropbuddy/analyze.html), we implemented three key fixes to resolve compatibility issues with the Gujarati voice:

1.  **Asynchronous Voices Handshake**:
    Browsers load the text-to-speech voice registry asynchronously in the background. On initial load, `speechSynthesis.getVoices()` is empty. We resolved this by preloading voices using the `voiceschanged` event:
    ```javascript
    let voicesList = [];
    function preloadVoices() {
        if ('speechSynthesis' in window) {
            voicesList = window.speechSynthesis.getVoices();
        }
    }
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = preloadVoices;
    }
    ```
2.  **Preventing Garbage Collection**:
    In Chrome and Android browsers, long speech synthesis tasks get cut off mid-sentence because the temporary `SpeechSynthesisUtterance` instance gets garbage collected. Storing the active utterance in a global variable (`currentUtteranceObj`) prevents this.
3.  **Strict Gujarati Key Matching**:
    Updated `CROP_TRANSLATIONS_GU` to map multi-word raw classes parsed from TFJS output (e.g. `"pepper, bell": "શિમલા મરચા"`, `"cherry (including sour)": "ચેરી"`).

---

## 3. Bhashini API Integration Checklist (Govt. of India)

Bhashini is the state-backed ULCA translation API. To replace browser-native Speech APIs with Bhashini's regional language models:

### A. Credentials Checklist
Sign up at the [Bhashini MyGov Portal](https://bhashini.gov.in/) to get:
*   `userID`
*   `apiKey` (Developer Key)
*   `ulcaApiKey` (Subscription/Usage Key)
*   `pipelineId` (E.g. MeitY ASR/Translation/TTS configuration reference)

### B. The 2-Step API Workflow

#### Step 1: Handshake (Fetch compute credentials)
Submit a POST request to:
`https://meity-auth.ulcacohort.org/ulca/apis/v1/model/getModelsPipeline`

*   **Request Body**:
    ```json
    {
      "pipelineTasks": [{ "taskType": "asr" }, { "taskType": "tts" }],
      "pipelineRequestConfig": { "pipelineId": "YOUR_PIPELINE_ID" }
    }
    ```
*   **Result**: Returns the active model IDs, auth tokens, and a temporary `computeUrl` callback endpoint.

#### Step 2: Compute Inference

##### 🎙️ Gujarati Speech-to-Text (ASR)
Post the Base64 audio buffer to the ASR model compute endpoint:
```json
{
  "pipelineTasks": [
    {
      "taskType": "asr",
      "config": {
        "language": { "sourceLanguage": "gu" },
        "audioFormat": "wav",
        "samplingRate": 16000
      }
    }
  ],
  "inputData": {
    "audio": [{ "audioContent": "BASE64_AUDIO_WAV_STRING" }]
  }
}
```
*   **Result**: Returns transcribed Gujarati text.

##### 🔊 Gujarati Text-to-Speech (TTS)
Post the text to the TTS model compute endpoint:
```json
{
  "pipelineTasks": [
    {
      "taskType": "tts",
      "config": {
        "language": { "sourceLanguage": "gu" },
        "gender": "female"
      }
    }
  ],
  "inputData": {
    "input": [{ "source": "નમસ્તે ખેડૂત મિત્ર" }]
  }
}
```
*   **Result**: Returns a Base64 audio wav file.
*   **Playback in Browser**:
    ```javascript
    const audioObj = new Audio("data:audio/wav;base64," + base64AudioData);
    audioObj.play();
    ```

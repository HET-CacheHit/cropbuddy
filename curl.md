# 🧪 CropBuddy API curl Testing Guide

This document lists the `curl` commands to test and validate all endpoints used by the CropBuddy web and mobile apps.

---

### 1. Test AI Chatbot (`/api/chat`)
Sends a text question to the Google Gemini 1.5 Flash assistant.

```bash
curl -X POST https://cropbuddy-rho.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the best fertilizer for Potato?",
    "history": []
  }'
```

---

### 2. Test Speech-to-Text (`/api/asr`)
Sends a base64 encoded audio snippet to be transcribed using OpenAI Whisper.

```bash
curl -X POST https://cropbuddy-rho.vercel.app/api/asr \
  -H "Content-Type: application/json" \
  -d '{
    "audio": "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
  }'
```

---

### 3. Test Crop Disease Classifier (`/api/predict_custom`)
Sends a base64 encoded leaf image to the custom classification model.

```bash
curl -X POST https://cropbuddy-rho.vercel.app/api/predict_custom \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
  }'
```

---

### 4. Test Weather Advisor (Open-Meteo API)
Queries local wind, temperature, and rain parameters (example coordinates set to Rajkot, Gujarat: `22.3072, 70.8022`).

```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=22.3072&longitude=70.8022&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation"
```

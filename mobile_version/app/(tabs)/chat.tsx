import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const BACKEND_URL = 'https://cropbuddy-rho.vercel.app';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hello! I am your CropBuddy AI Advisor. Ask me anything about crop diseases, fertilizers, or soil care. You can type or use the microphone to speak!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lang, setLang] = useState<'en' | 'gu'>('en');
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Send message to Gemini /api/chat Vercel API
  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // 1. Add user message to state
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);
    
    // Auto Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Create chat history format
      const history = messages.slice(1).map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      // Call Vercel chat API
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history,
          systemPrompt: lang === 'gu' ? 
            "તમે ક્રોપ બડી છો, એક ખેડૂત મિત્ર એઆઈ સલાહકાર. પાક રોગો, દવાઓ અને ખાતર ગણતરી વિશે ગુજરાતી ભાષામાં સચોટ, ટૂંકા અને વ્યવહારુ જવાબો આપો." : undefined
        })
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const botMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: data.reply };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Auto Read Aloud TTS
      Speech.speak(data.reply, { language: lang === 'en' ? 'en' : 'hi-IN' }); // Fallback to Hindi-IN synthesis for Gujarati if not natively supported on device

      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    } catch (error) {
      Alert.alert('Chat Error', 'Could not get response from AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Start Audio Recording using expo-av
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone permissions are required for voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
    } catch (err) {
      console.error('Failed to start recording:', err);
      setIsRecording(false);
    }
  };

  // Stop Recording, read as Base64, and send to Whisper ASR Vercel API
  const stopRecording = async () => {
    if (!recordingRef.current) return;

    setIsRecording(false);
    setLoading(true);

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      if (!uri) return;

      // Read audio file as Base64 string
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64'
      });

      // Call Vercel ASR endpoint
      const res = await fetch(`${BACKEND_URL}/api/asr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      if (data.text) {
        // Automatically send the transcribed text to Gemini Chat
        await sendMessage(data.text);
      } else {
        Alert.alert('Speech Not Recognized', 'Please try speaking closer to the microphone.');
      }
    } catch (err) {
      console.error('ASR error:', err);
      Alert.alert('ASR Failed', 'Could not process audio.');
    } finally {
      setLoading(false);
      recordingRef.current = null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.langContainer}>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLang(prev => prev === 'en' ? 'gu' : 'en')}>
          <Text style={styles.langBtnText}>{lang === 'en' ? 'ગુજરાતી' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef} 
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((item) => (
          <View 
            key={item.id} 
            style={[
              styles.messageBubble, 
              item.role === 'user' ? styles.userBubble : styles.modelBubble
            ]}
          >
            <Text style={[
              styles.messageText,
              item.role === 'user' ? styles.userText : styles.modelText
            ]}>
              {item.text}
            </Text>
            {item.role === 'model' && (
              <TouchableOpacity 
                style={styles.speakIcon}
                onPress={() => Speech.speak(item.text, { language: lang === 'en' ? 'en' : 'hi-IN' })}
              >
                <FontAwesome name="volume-up" size={14} color="#52b788" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#1b4332" />
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder={lang === 'en' ? "Ask CropBuddy..." : "પ્રશ્ન પૂછો..."}
          placeholderTextColor="#74c69d"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity 
          style={[styles.actionBtn, isRecording ? styles.recordingBtn : styles.micBtn]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          <FontAwesome name={isRecording ? "stop" : "microphone"} size={18} color="#ffffff" />
        </TouchableOpacity>

        {inputText.trim().length > 0 && (
          <TouchableOpacity 
            style={[styles.actionBtn, styles.sendBtn]}
            onPress={() => sendMessage(inputText)}
          >
            <FontAwesome name="paper-plane" size={16} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fbf7',
  },
  langContainer: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  langBtn: {
    backgroundColor: '#e2f3e8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#95d5b2',
  },
  langBtnText: {
    color: '#1b4332',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatScroll: {
    flex: 1,
    width: '100%',
  },
  chatContent: {
    padding: 20,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
    position: 'relative',
  },
  userBubble: {
    backgroundColor: '#1b4332',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  modelBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1.5,
    borderColor: '#d8f3dc',
    paddingRight: 30,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#ffffff',
  },
  modelText: {
    color: '#1b4332',
  },
  speakIcon: {
    position: 'absolute',
    right: 8,
    bottom: 8,
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d8f3dc',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1.5,
    borderTopColor: '#d8f3dc',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#f4fbf7',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#b7e4c7',
    fontSize: 14,
    color: '#1b4332',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    backgroundColor: '#2d6a4f',
  },
  recordingBtn: {
    backgroundColor: '#cc3300',
  },
  sendBtn: {
    backgroundColor: '#1b4332',
  },
});

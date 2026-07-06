import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function TabThreeScreen() {
  const [lang, setLang] = useState<'en' | 'gu'>('gu');
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: lang === 'en' 
        ? "Hello! I am your AI Crop Advisor. Ask me anything about crop health, organic fertilizers, weather alerts, or APMC market rates!"
        : "નમસ્તે! હું તમારો એઆઈ પાક સલાહકાર છું. મને પાકની સુરક્ષા, સેન્દ્રિય ખાતરો, હવામાન ચેતવણીઓ અથવા એપીએમસી બજાર ભાવ વિશે કંઈપણ પૂછો!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Server LAN connection configuration
  const [serverIp, setServerIp] = useState<string>('192.168.29.18:3000');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Audio Recording States
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Toggle Language
  const handleLangToggle = () => {
    const newLang = lang === 'en' ? 'gu' : 'en';
    setLang(newLang);
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: newLang === 'en'
          ? "Hello! I am your AI Crop Advisor. Ask me anything about crop health, organic fertilizers, weather alerts, or APMC market rates!"
          : "નમસ્તે! હું તમારો એઆઈ પાક સલાહકાર છું. મને પાકની સુરક્ષા, સેન્દ્રિય ખાતરો, હવામાન ચેતવણીઓ અથવા એપીએમસી બજાર ભાવ વિશે કંઈપણ પૂછો!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Text-To-Speech Narrator using expo-speech
  const speakText = (text: string, locale: 'en' | 'gu') => {
    Speech.stop();
    Speech.speak(text, {
      language: locale === 'en' ? 'en-US' : 'gu-IN',
      rate: 0.9,
    });
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      Speech.stop();
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Denied", "Microphone access is required for voice commands.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Recording Error", "Could not start audio recorder.");
    }
  };

  // Stop Recording & Send to Whisper ASR
  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    setRecording(null);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;

      setIsTranscribing(true);

      // Read audio recording as base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to backend server /api/asr
      const url = `http://${serverIp}/api/asr`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      });

      if (!response.ok) {
        throw new Error("Voice transcription failed.");
      }

      const data = await response.json();
      if (data.text) {
        setInputText(data.text);
      } else {
        Alert.alert("Speech Error", "Could not transcribe audio. Please speak clearly.");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Speech Server Error", `ASR Server failed: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Send Message to Gemini Chatbot
  const handleSendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAiResponding(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const url = `http://${serverIp}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${textToSend} (Please reply in ${lang === 'en' ? 'English' : 'Gujarati'} language only).`
        })
      });

      if (!response.ok) {
        throw new Error("Chatbot failed to respond.");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
      speakText(data.reply, lang);

    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        sender: 'ai',
        text: `Error connecting to AI Advisor: ${err.message}. Please verify the Server IP is configured correctly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiResponding(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {lang === 'en' ? "AI Crop Advisor" : "એઆઈ પાક સલાહકાર"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {lang === 'en' ? "Gemini Neural Assistant" : "જેમિની એઆઈ આસિસ્ટન્ટ"}
          </Text>
        </View>
        <TouchableOpacity style={styles.langToggle} onPress={handleLangToggle}>
          <Text style={styles.langText}>{lang === 'en' ? 'ગુજરાતી' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      {/* Developer connection settings */}
      <TouchableOpacity 
        style={styles.settingsHeader} 
        onPress={() => setShowSettings(!showSettings)}
      >
        <Ionicons name="settings-sharp" size={14} color="#40916c" />
        <Text style={styles.settingsHeaderText}>
          {lang === 'en' ? "Connection Settings" : "કનેક્શન સેટિંગ્સ"}
        </Text>
        <Ionicons name={showSettings ? "chevron-up" : "chevron-down"} size={14} color="#40916c" />
      </TouchableOpacity>

      {showSettings && (
        <View style={styles.settingsBox}>
          <Text style={styles.settingsLabel}>Local Server IP & Port:</Text>
          <TextInput
            style={styles.settingsInput}
            value={serverIp}
            onChangeText={setServerIp}
            placeholder="e.g. 192.168.29.18:3000"
          />
        </View>
      )}

      {/* Message List */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messageContainer}
        contentContainerStyle={styles.messageContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.bubbleContainer,
              msg.sender === 'user' ? styles.userBubbleContainer : styles.aiBubbleContainer
            ]}
          >
            <View 
              style={[
                styles.bubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              <Text 
                style={[
                  styles.bubbleText,
                  msg.sender === 'user' ? styles.userBubbleText : styles.aiBubbleText
                ]}
              >
                {msg.text}
              </Text>
              
              <View style={styles.bubbleFooter}>
                <Text style={styles.bubbleTime}>{msg.timestamp}</Text>
                {msg.sender === 'ai' && (
                  <View style={styles.audioControls}>
                    <TouchableOpacity onPress={() => speakText(msg.text, lang)} style={styles.audioBtn}>
                      <Ionicons name="volume-medium-sharp" size={16} color="#1b4332" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Speech.stop()} style={styles.audioBtn}>
                      <Ionicons name="stop" size={14} color="#d90429" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}

        {isAiResponding && (
          <View style={[styles.bubbleContainer, styles.aiBubbleContainer]}>
            <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
              <ActivityIndicator color="#2d6a4f" />
              <Text style={[styles.bubbleText, styles.loadingText]}>
                {lang === 'en' ? "Gemini is typing..." : "જેમિની વિચારી રહ્યું છે..."}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={[
            styles.micBtn,
            isRecording && styles.micBtnActive
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        >
          {isTranscribing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name={isRecording ? "mic-off" : "mic"} size={22} color="white" />
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder={lang === 'en' ? "Ask CropBuddy..." : "સમસ્યા અહીં લખો..."}
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity 
          style={styles.sendBtn}
          onPress={handleSendMessage}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fbf7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1b4332'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#52b788',
    fontWeight: '500'
  },
  langToggle: {
    backgroundColor: '#d8f3e5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#b7e4c7'
  },
  langText: {
    color: '#1b4332',
    fontWeight: 'bold',
    fontSize: 12
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
    backgroundColor: '#e8f5e9',
    borderBottomWidth: 1,
    borderBottomColor: '#c8e6c9'
  },
  settingsHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#40916c'
  },
  settingsBox: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#c8e6c9'
  },
  settingsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1b4332',
    marginBottom: 6
  },
  settingsInput: {
    borderWidth: 1,
    borderColor: '#a5d6a7',
    borderRadius: 6,
    padding: 6,
    fontSize: 13,
    backgroundColor: 'white',
    color: '#333'
  },
  messageContainer: {
    flex: 1,
  },
  messageContent: {
    padding: 15,
    paddingBottom: 25
  },
  bubbleContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    width: '100%'
  },
  userBubbleContainer: {
    justifyContent: 'flex-end',
  },
  aiBubbleContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  userBubble: {
    backgroundColor: '#2d6a4f',
    borderTopRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#e8f5e9'
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22
  },
  userBubbleText: {
    color: 'white',
  },
  aiBubbleText: {
    color: '#1b4332',
  },
  loadingText: {
    color: '#666',
    fontStyle: 'italic'
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    paddingTop: 4
  },
  bubbleTime: {
    fontSize: 10,
    color: '#999'
  },
  audioControls: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
  },
  audioBtn: {
    padding: 2
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    gap: 10
  },
  micBtn: {
    backgroundColor: '#2d6a4f',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: {
    backgroundColor: '#d90429',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    maxHeight: 100,
    backgroundColor: '#fafafa'
  },
  sendBtn: {
    backgroundColor: '#2d6a4f',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

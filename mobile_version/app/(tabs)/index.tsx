import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const LABELS = {
  en: {
    welcome: "Welcome to",
    subWelcome: "Your AI-Powered Agri-Assistant",
    langBtn: "ગુજરાતી",
    scanCard: "AI Leaf Scanner",
    scanDesc: "Snap leaf photos to instantly diagnose 38 crop diseases.",
    weatherCard: "Weather Spray Advisor",
    weatherDesc: "Check local wind speed & humidity for safe chemical spraying.",
    chatCard: "AI Crop Chatbot",
    chatDesc: "Ask custom questions in English or Gujarati via voice/text.",
    toolsCard: "Agri Calculators",
    toolsDesc: "NPK ratios, urea dosages, and APMC market mandi prices.",
    calendarCard: "Crop Growth Calendar",
    calendarDesc: "Track growth lifecycle stages and disease warnings.",
    mapCard: "Community Outbreak Map",
    mapDesc: "Monitor and report pest outbreaks in your area.",
    footer: "Sustainable Digital Farming"
  },
  gu: {
    welcome: "આપનું સ્વાગત છે",
    subWelcome: "તમારો એઆઈ પાક રક્ષક મિત્ર",
    langBtn: "English",
    scanCard: "રોગ નિદાન સ્કેનર",
    scanDesc: "પાક રોગ ઓળખવા માટે પાનનો ફોટો લો અથવા અપલોડ કરો.",
    weatherCard: "હવામાન સ્પ્રે સલાહ",
    weatherDesc: "દવાના છંટકાવ માટે પવનની ગતિ અને ભેજ તપાસો.",
    chatCard: "એઆઈ પાક સલાહકાર",
    chatDesc: "પ્રશ્નો પૂછવા માટે એઆઈ બોટ સાથે વૉઇસ અથવા ટેક્સ્ટ ચેટ કરો.",
    toolsCard: "કૃષિ કેલ્ક્યુલેટર",
    toolsDesc: "ખાતર ગણતરી અને માર્કેટ યાર્ડના તાજા બજાર ભાવ.",
    calendarCard: "પાક સમયપત્રક સમયરેખા",
    calendarDesc: "પાક વિકાસ સમયપત્રક અને સંભવિત રોગ ચેતવણીઓ જુઓ.",
    mapCard: "રોગચાળા નકશો",
    mapDesc: "ખેડૂત સમુદાય દ્વારા નોંધાયેલ રોગચાળાના નકશા જુઓ.",
    footer: "ટકાઉ ડિજિટલ ખેતી"
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'gu'>('en');
  const labels = LABELS[lang];

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'gu' : 'en'));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>Crop<Text style={styles.logoSpan}>Buddy</Text></Text>
          <TouchableOpacity style={styles.langButton} onPress={toggleLanguage}>
            <Text style={styles.langButtonText}>{labels.langBtn}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subHeader}>{labels.welcome} CropBuddy</Text>
        <Text style={styles.tagline}>{labels.subWelcome}</Text>
      </View>

      {/* Feature Menu Grid */}
      <View style={styles.menuGrid}>
        
        {/* Scanner Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/two')}
          activeOpacity={0.9}
        >
          <View style={[styles.iconBox, { backgroundColor: '#d8f3dc' }]}>
            <FontAwesome name="camera" size={24} color="#1b4332" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{labels.scanCard}</Text>
            <Text style={styles.cardDesc}>{labels.scanDesc}</Text>
          </View>
        </TouchableOpacity>

        {/* Weather Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/weather')}
          activeOpacity={0.9}
        >
          <View style={[styles.iconBox, { backgroundColor: '#d8f3dc' }]}>
            <FontAwesome name="cloud" size={24} color="#1b4332" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{labels.weatherCard}</Text>
            <Text style={styles.cardDesc}>{labels.weatherDesc}</Text>
          </View>
        </TouchableOpacity>

        {/* AI Chat Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/chat')}
          activeOpacity={0.9}
        >
          <View style={[styles.iconBox, { backgroundColor: '#d8f3dc' }]}>
            <FontAwesome name="comments" size={24} color="#1b4332" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{labels.chatCard}</Text>
            <Text style={styles.cardDesc}>{labels.chatDesc}</Text>
          </View>
        </TouchableOpacity>

        {/* Tools Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/tools')}
          activeOpacity={0.9}
        >
          <View style={[styles.iconBox, { backgroundColor: '#d8f3dc' }]}>
            <FontAwesome name="calculator" size={24} color="#1b4332" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{labels.toolsCard}</Text>
            <Text style={styles.cardDesc}>{labels.toolsDesc}</Text>
          </View>
        </TouchableOpacity>

        {/* Crop Calendar Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/calendar')}
          activeOpacity={0.9}
        >
          <View style={[styles.iconBox, { backgroundColor: '#d8f3dc' }]}>
            <FontAwesome name="calendar" size={24} color="#1b4332" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{labels.calendarCard}</Text>
            <Text style={styles.cardDesc}>{labels.calendarDesc}</Text>
          </View>
        </TouchableOpacity>

        {/* Community Outbreak Map Card */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/map')}
          activeOpacity={0.9}
        >
          <View style={[styles.iconBox, { backgroundColor: '#d8f3dc' }]}>
            <FontAwesome name="map" size={24} color="#1b4332" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{labels.mapCard}</Text>
            <Text style={styles.cardDesc}>{labels.mapDesc}</Text>
          </View>
        </TouchableOpacity>

      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <FontAwesome name="leaf" size={16} color="#74c69d" />
        <Text style={styles.footerText}> {labels.footer}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fbf7',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#1b4332',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  logoSpan: {
    color: '#74c69d',
  },
  langButton: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#74c69d',
  },
  langButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#b7e4c7',
  },
  tagline: {
    fontSize: 14,
    color: '#d8f3dc',
    marginTop: 4,
  },
  menuGrid: {
    gap: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d8f3dc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#52b788',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#74c69d',
    fontWeight: 'bold',
  },
});

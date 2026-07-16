import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const LABELS = {
  en: {
    loadingLoc: "Getting GPS location...",
    loadingWeather: "Fetching local weather...",
    errorTitle: "Error",
    gpsError: "Location permission is required for weather insights.",
    apiError: "Failed to fetch weather data.",
    title: "Weather Spray Advisor",
    subtitle: "Real-time conditions for chemical application",
    safetyHeadline: "Spray Safety Status:",
    safe: "✅ SAFE TO SPRAY",
    warning: "⚠️ WARNING: NOT SAFE TO SPRAY",
    tempLabel: "Temperature",
    windLabel: "Wind Speed",
    humidityLabel: "Humidity",
    rainLabel: "Rain Probability",
    refreshBtn: "Refresh Weather",
    safetyTips: "Guidelines for Chemical Spraying:",
    tip1: "Ideal wind speed is 3–10 km/h. Calm winds (<3 km/h) can lead to drift upward.",
    tip2: "Avoid spraying if temperature exceeds 30°C to prevent rapid evaporation.",
    tip3: "Do not spray if rain is predicted within 2 hours.",
    langBtn: "ગુજરાતી"
  },
  gu: {
    loadingLoc: "જીપીએસ સ્થાન મેળવી રહ્યાં છીએ...",
    loadingWeather: "હવામાન વિગતો મેળવી રહ્યાં છીએ...",
    errorTitle: "ભૂલ",
    gpsError: "હવામાન સલાહ મેળવવા માટે લોકેશન પરમિશન આપવી જરૂરી છે.",
    apiError: "હવામાન ડેટા મેળવવામાં નિષ્ફળતા.",
    title: "હવામાન સ્પ્રે સલાહકાર",
    subtitle: "દવાના છંટકાવ માટે લાઈવ હવામાન વિગતો",
    safetyHeadline: "સ્પ્રે સલામતી સ્થિતિ:",
    safe: "✅ છંટકાવ માટે અનુકૂળ સમય છે",
    warning: "⚠️ ચેતવણી: છંટકાવ માટે યોગ્ય સમય નથી",
    tempLabel: "તાપમાન",
    windLabel: "પવનની ગતિ",
    humidityLabel: "ભેજનું પ્રમાણ",
    rainLabel: "વરસાદની સંભાવના",
    refreshBtn: "અપડેટ કરો",
    safetyTips: "જંતુનાશક દવા છાંટવા માટેના નિયમો:",
    tip1: "પવનની ગતિ ૩ થી ૧૦ કિમી/કલાક હોવી જોઈએ. પવન ઓછો હોય તો દવા હવામાં ઉડી જશે.",
    tip2: "દવાનું બાષ્પીભવન અટકાવવા માટે ૩૦°C થી વધુ તાપમાનમાં છંટકાવ ટાળો.",
    tip3: "આગામી ૨ કલાકમાં વરસાદ પડવાની સંભાવના હોય તો છંટકાવ કરશો નહીં.",
    langBtn: "English"
  }
};

export default function WeatherScreen() {
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [lang, setLang] = useState<'en' | 'gu'>('en');
  const [weather, setWeather] = useState<any>(null);
  const [isSafe, setIsSafe] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const labels = LABELS[lang];

  const fetchWeather = async () => {
    setLoading(true);
    setErrorMsg(null);
    setLoadingText(labels.loadingLoc);

    try {
      // 1. Get GPS coordinates
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg(labels.gpsError);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setLoadingText(labels.loadingWeather);

      // 2. Fetch Open-Meteo weather API
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&forecast_days=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();

      const data = await res.json();
      const current = data.current;

      const temp = current.temperature_2m;
      const wind = current.wind_speed_10m;
      const humidity = current.relative_humidity_2m;
      const rain = current.precipitation;

      // 3. Evaluate spray safety guidelines
      // Safe wind range: 3 to 12 km/h, Temp < 30°C, Rain = 0
      const windSafe = wind >= 3.0 && wind <= 12.0;
      const tempSafe = temp <= 30.0;
      const rainSafe = rain <= 0.1;

      setIsSafe(windSafe && tempSafe && rainSafe);
      setWeather({ temp, wind, humidity, rain });

    } catch (err) {
      setErrorMsg(labels.apiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [lang]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.langContainer}>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLang(prev => prev === 'en' ? 'gu' : 'en')}>
          <Text style={styles.langBtnText}>{labels.langBtn}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{labels.title}</Text>
      <Text style={styles.subtitle}>{labels.subtitle}</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1b4332" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorBox}>
          <FontAwesome name="exclamation-circle" size={32} color="#cc3300" />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchWeather}>
            <Text style={styles.refreshBtnText}>{labels.refreshBtn}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ width: '100%' }}>
          {/* Safety Gauge */}
          <View style={[styles.safetyCard, { borderColor: isSafe ? '#74c69d' : '#e63946' }]}>
            <Text style={styles.safetyHeader}>{labels.safetyHeadline}</Text>
            <Text style={[styles.safetyStatus, { color: isSafe ? '#2d6a4f' : '#cc3300' }]}>
              {isSafe ? labels.safe : labels.warning}
            </Text>
          </View>

          {/* Grid Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <FontAwesome name="thermometer" size={24} color="#1b4332" />
              <Text style={styles.statVal}>{weather.temp}°C</Text>
              <Text style={styles.statLabel}>{labels.tempLabel}</Text>
            </View>
            <View style={styles.statBox}>
              <FontAwesome name="tint" size={24} color="#1b4332" />
              <Text style={styles.statVal}>{weather.humidity}%</Text>
              <Text style={styles.statLabel}>{labels.humidityLabel}</Text>
            </View>
            <View style={styles.statBox}>
              <FontAwesome name="flag" size={24} color="#1b4332" />
              <Text style={styles.statVal}>{weather.wind} km/h</Text>
              <Text style={styles.statLabel}>{labels.windLabel}</Text>
            </View>
            <View style={styles.statBox}>
              <FontAwesome name="umbrella" size={24} color="#1b4332" />
              <Text style={styles.statVal}>{weather.rain > 0.1 ? 'Yes' : 'None'}</Text>
              <Text style={styles.statLabel}>{labels.rainLabel}</Text>
            </View>
          </View>

          {/* Guidelines Box */}
          <View style={styles.tipsBox}>
            <Text style={styles.tipsHeader}>{labels.safetyTips}</Text>
            <Text style={styles.tipItem}>• {labels.tip1}</Text>
            <Text style={styles.tipItem}>• {labels.tip2}</Text>
            <Text style={styles.tipItem}>• {labels.tip3}</Text>
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={fetchWeather}>
            <FontAwesome name="refresh" size={16} color="#ffffff" />
            <Text style={styles.refreshBtnText}>{labels.refreshBtn}</Text>
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'center',
  },
  langContainer: {
    alignSelf: 'flex-end',
    marginBottom: 10,
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1b4332',
    textAlign: 'center',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 13,
    color: '#52b788',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  loadingBox: {
    marginTop: 60,
    alignItems: 'center',
    gap: 15,
  },
  loadingText: {
    color: '#1b4332',
    fontWeight: '600',
  },
  errorBox: {
    marginTop: 60,
    alignItems: 'center',
    gap: 15,
  },
  errorText: {
    color: '#cc3300',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  safetyCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 20,
  },
  safetyHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#74c69d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  safetyStatus: {
    fontSize: 18,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d8f3dc',
  },
  statVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b4332',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#52b788',
    marginTop: 2,
    fontWeight: '600',
  },
  tipsBox: {
    width: '100%',
    backgroundColor: '#e2f3e8',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#95d5b2',
    marginBottom: 25,
  },
  tipsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 12,
    color: '#2d6a4f',
    marginBottom: 6,
    lineHeight: 17,
  },
  refreshBtn: {
    width: '100%',
    backgroundColor: '#1b4332',
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

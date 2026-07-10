import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabOneScreen() {
  const [lang, setLang] = useState<'en' | 'gu'>('gu');
  const [landSize, setLandSize] = useState<string>('');
  const [landUnit, setLandUnit] = useState<'bigha' | 'acre' | 'hectare'>('bigha');
  const [crop, setCrop] = useState<'paddy' | 'wheat' | 'cotton' | 'sugarcane' | 'groundnut'>('paddy');
  const [soilType, setSoilType] = useState<'alluvial' | 'black' | 'red' | 'laterite' | 'desert'>('alluvial');
  const [soilFertility, setSoilFertility] = useState<'low' | 'medium' | 'high'>('medium');
  const [calcResult, setCalcResult] = useState<{ urea: number; dap: number; mop: number } | null>(null);

  // UI labels in English & Gujarati
  const labels = {
    en: {
      title: "CropBuddy Dashboard",
      subtitle: "Smart Farming Assistant",
      weatherTitle: "Today's Weather Advisor",
      weatherDesc: "Sunny • 32°C • Humidity 62%",
      weatherAdvice: "💡 Good day for pesticide spray and fertilizer application.",
      npkTitle: "Soil Nutrient & NPK Calculator",
      landSizePlaceholder: "Enter land size (e.g. 5)",
      calculateBtn: "Calculate Bags",
      resultTitle: "Required Bags (approx. 50kg each):",
      ureaLabel: "Urea (Nitrogen)",
      dapLabel: "DAP (Phosphorus)",
      mopLabel: "MOP (Potassium)",
      mandiTitle: "APMC Market Prices (Gujarat)",
      cropHeader: "Crop",
      priceHeader: "Avg Price (per 20kg)",
      trendHeader: "Trend",
      cropLabel: "Select Crop",
      soilTypeLabel: "Select Soil Type",
      fertilityLabel: "Soil Fertility level (Soil Health)",
      cropPaddy: "Paddy (Rice)",
      cropWheat: "Wheat",
      cropCotton: "Cotton",
      cropSugarcane: "Sugarcane",
      cropGroundnut: "Groundnut",
      soilAlluvial: "Alluvial (Clayey)",
      soilBlack: "Black (Regur)",
      soilRed: "Red Soil",
      soilLaterite: "Laterite",
      soilDesert: "Desert (Sandy)",
      fertilityLow: "Low (+25% dose)",
      fertilityMedium: "Medium (Standard)",
      fertilityHigh: "High (-25% dose)"
    },
    gu: {
      title: "ક્રોપબડી ડેશબોર્ડ",
      subtitle: "સ્માર્ટ કૃષિ સહાયક",
      weatherTitle: "આજનું હવામાન અને સલાહ",
      weatherDesc: "તડકો • ૩૨°C • ભેજ ૬૨%",
      weatherAdvice: "💡 દવા છંટકાવ અને ખાતર આપવા માટે આજનો દિવસ ઉત્તમ છે.",
      npkTitle: "જમીન પોષક તત્વો અને NPK કેલ્ક્યુલેટર",
      landSizePlaceholder: "જમીન માપ દાખલ કરો (દા.ત. ૫)",
      calculateBtn: "ખાતર ગણતરી કરો",
      resultTitle: "જરૂરી ખાતર થેલીઓ (આશરે ૫૦ કિલોની):",
      ureaLabel: "યુરિયા (નાઇટ્રોજન)",
      dapLabel: "ડી.એ.પી. (ફોસ્ફરસ)",
      mopLabel: "એમ.ઓ.પી. (પોટાશ)",
      mandiTitle: "એ.પી.એમ.સી. બજાર ભાવ (ગુજરાત)",
      cropHeader: "પાક",
      priceHeader: "સરેરાશ ભાવ (૨૦ કિલોના)",
      trendHeader: "ટ્રેન્ડ",
      cropLabel: "પાક પસંદ કરો",
      soilTypeLabel: "જમીનનો પ્રકાર પસંદ કરો",
      fertilityLabel: "જમીનની ફળદ્રુપતા સ્તર (સોઇલ ટેસ્ટ)",
      cropPaddy: "ડાંગર (ચોખા)",
      cropWheat: "ઘઉં",
      cropCotton: "કપાસ",
      cropSugarcane: "શેરડી",
      cropGroundnut: "મગફળી",
      soilAlluvial: "કાંપવાળી જમીન",
      soilBlack: "કાળી (રેગુર) જમીન",
      soilRed: "લાલ જમીન",
      soilLaterite: "પડખાઉ (રાતી) જમીન",
      soilDesert: "રેતાળ જમીન",
      fertilityLow: "ઓછી (+૨૫% ખાતર)",
      fertilityMedium: "મધ્યમ (સામાન્ય)",
      fertilityHigh: "વધારે (-૨૫% ખાતર)"
    }
  };

  const currentLabels = labels[lang];

  // NPK calculation logic based on Indian Soil Types
  const handleCalculate = () => {
    const size = parseFloat(landSize);
    if (isNaN(size) || size <= 0) return;

    // Convert land size to Bighas first, then convert Bighas to Hectares (1 Hectare = 6.25 Bighas)
    let bighas = size;
    if (landUnit === 'acre') bighas = size * 2.5;
    else if (landUnit === 'hectare') bighas = size * 6.25;

    const hectares = bighas / 6.25;

    // Base NPK targets (kg/hectare)
    const cropBaselines = {
      paddy: { n: 120, p: 60, k: 60 },
      wheat: { n: 120, p: 60, k: 40 },
      cotton: { n: 80, p: 40, k: 40 },
      sugarcane: { n: 250, p: 80, k: 80 },
      groundnut: { n: 20, p: 40, k: 40 }
    };

    // Soil type adjustments
    const soilCorrections = {
      alluvial: { n: 0.15, p: 0.0, k: -0.10 },
      black: { n: 0.20, p: 0.10, k: -0.20 },
      red: { n: 0.10, p: 0.25, k: 0.0 },
      laterite: { n: 0.25, p: 0.20, k: 0.15 },
      desert: { n: 0.30, p: 0.05, k: 0.0 }
    };

    // Fertility levels multiplier
    const fertilityFactors = {
      low: 1.25,
      medium: 1.0,
      high: 0.75
    };

    const baseCrop = cropBaselines[crop];
    const correction = soilCorrections[soilType];
    const fertilityMultiplier = fertilityFactors[soilFertility];

    // Compute target nutrients in kg
    const targetN = baseCrop.n * hectares * (1 + correction.n) * fertilityMultiplier;
    const targetP = baseCrop.p * hectares * (1 + correction.p) * fertilityMultiplier;
    const targetK = baseCrop.k * hectares * (1 + correction.k) * fertilityMultiplier;

    // Commercial Fertilizers: DAP (46% P, 18% N), Urea (46% N), MOP (60% K)
    const dapKg = targetP / 0.46;
    const nFromDap = dapKg * 0.18;
    const ureaKg = Math.max(0, targetN - nFromDap) / 0.46;
    const mopKg = targetK / 0.60;

    // 50kg Bags calculation (ceil up to full bags)
    const ureaBags = Math.ceil(ureaKg / 50);
    const dapBags = Math.ceil(dapKg / 50);
    const mopBags = Math.ceil(mopKg / 50);

    setCalcResult({
      urea: ureaBags,
      dap: dapBags,
      mop: mopBags
    });
  };

  // Mock Mandi Prices Data
  const mandiData = [
    { nameEn: "Wheat (ઘઉં)", price: "₹480 - ₹540", trend: "up" },
    { nameEn: "Cotton (કપાસ)", price: "₹1,450 - ₹1,680", trend: "up" },
    { nameEn: "Groundnut (મગફળી)", price: "₹1,250 - ₹1,420", trend: "down" },
    { nameEn: "Cumin (જીરું)", price: "₹4,200 - ₹5,800", trend: "up" },
    { nameEn: "Mustard (રાઈ)", price: "₹980 - ₹1,120", trend: "stable" }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header with Language Switcher */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{currentLabels.title}</Text>
          <Text style={styles.headerSubtitle}>{currentLabels.subtitle}</Text>
        </View>
        <TouchableOpacity 
          style={styles.langToggle} 
          onPress={() => setLang(l => l === 'en' ? 'gu' : 'en')}
        >
          <Text style={styles.langText}>{lang === 'en' ? 'ગુજરાતી' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      {/* Weather Widget */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="sunny" size={24} color="#f5a623" />
          <Text style={styles.cardTitle}>{currentLabels.weatherTitle}</Text>
        </View>
        <Text style={styles.weatherInfo}>{currentLabels.weatherDesc}</Text>
        <Text style={styles.weatherAdvice}>{currentLabels.weatherAdvice}</Text>
      </View>

      {/* NPK Calculator */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calculator" size={24} color="#2d6a4f" />
          <Text style={styles.cardTitle}>{currentLabels.npkTitle}</Text>
        </View>

        {/* Crop Selection */}
        <Text style={styles.inputHeading}>{currentLabels.cropLabel}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {(['paddy', 'wheat', 'cotton', 'sugarcane', 'groundnut'] as const).map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.selectorBtn, crop === c && styles.selectorBtnActive]}
              onPress={() => setCrop(c)}
            >
              <Text style={[styles.selectorBtnText, crop === c && styles.selectorBtnTextActive]}>
                {currentLabels[`crop${c.charAt(0).toUpperCase() + c.slice(1)}` as keyof typeof currentLabels]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Soil Type Selection */}
        <Text style={styles.inputHeading}>{currentLabels.soilTypeLabel}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {(['alluvial', 'black', 'red', 'laterite', 'desert'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.selectorBtn, soilType === s && styles.selectorBtnActive]}
              onPress={() => setSoilType(s)}
            >
              <Text style={[styles.selectorBtnText, soilType === s && styles.selectorBtnTextActive]}>
                {currentLabels[`soil${s.charAt(0).toUpperCase() + s.slice(1)}` as keyof typeof currentLabels]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Soil Fertility Selection */}
        <Text style={styles.inputHeading}>{currentLabels.fertilityLabel}</Text>
        <View style={styles.gridContainer}>
          {(['low', 'medium', 'high'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.selectorBtn, { flex: 1 }, soilFertility === f && styles.selectorBtnActive]}
              onPress={() => setSoilFertility(f)}
            >
              <Text style={[styles.selectorBtnText, soilFertility === f && styles.selectorBtnTextActive]}>
                {currentLabels[`fertility${f.charAt(0).toUpperCase() + f.slice(1)}` as keyof typeof currentLabels]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Land Size Input */}
        <TextInput
          style={styles.input}
          placeholder={currentLabels.landSizePlaceholder}
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={landSize}
          onChangeText={setLandSize}
        />

        <View style={styles.unitContainer}>
          {(['bigha', 'acre', 'hectare'] as const).map((unit) => (
            <TouchableOpacity
              key={unit}
              style={[
                styles.unitBtn,
                landUnit === unit && styles.unitBtnActive
              ]}
              onPress={() => setLandUnit(unit)}
            >
              <Text style={[
                styles.unitBtnText,
                landUnit === unit && styles.unitBtnTextActive
              ]}>
                {unit.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate}>
          <Text style={styles.calcBtnText}>{currentLabels.calculateBtn}</Text>
        </TouchableOpacity>

        {calcResult && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>{currentLabels.resultTitle}</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{currentLabels.ureaLabel}</Text>
              <Text style={styles.resultValue}>{calcResult.urea} Bags</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{currentLabels.dapLabel}</Text>
              <Text style={styles.resultValue}>{calcResult.dap} Bags</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>{currentLabels.mopLabel}</Text>
              <Text style={styles.resultValue}>{calcResult.mop} Bags</Text>
            </View>
          </View>
        )}
      </View>

      {/* Mandi Prices */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="trending-up" size={24} color="#2d6a4f" />
          <Text style={styles.cardTitle}>{currentLabels.mandiTitle}</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableCol, styles.tableHeaderCell, { flex: 2 }]}>{currentLabels.cropHeader}</Text>
          <Text style={[styles.tableCol, styles.tableHeaderCell, { flex: 2 }]}>{currentLabels.priceHeader}</Text>
          <Text style={[styles.tableCol, styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>{currentLabels.trendHeader}</Text>
        </View>

        {mandiData.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.tableCol, styles.cropName, { flex: 2 }]}>{item.nameEn}</Text>
            <Text style={[styles.tableCol, styles.cropPrice, { flex: 2 }]}>{item.price}</Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              {item.trend === 'up' && <Ionicons name="arrow-up-circle" size={20} color="#2b9348" />}
              {item.trend === 'down' && <Ionicons name="arrow-down-circle" size={20} color="#d90429" />}
              {item.trend === 'stable' && <Ionicons name="remove-circle" size={20} color="#6c757d" />}
            </View>
          </View>
        ))}
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
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b4332'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#52b788',
    fontWeight: '500'
  },
  langToggle: {
    backgroundColor: '#d8f3e5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#b7e4c7'
  },
  langText: {
    color: '#1b4332',
    fontWeight: 'bold',
    fontSize: 13
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b4332'
  },
  weatherInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d6a4f',
    marginBottom: 8
  },
  weatherAdvice: {
    fontSize: 14,
    color: '#40916c',
    lineHeight: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fafafa',
    marginBottom: 15
  },
  unitContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fafafa'
  },
  unitBtnActive: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f'
  },
  unitBtnText: {
    fontWeight: 'bold',
    color: '#666',
    fontSize: 12
  },
  unitBtnTextActive: {
    color: 'white'
  },
  calcBtn: {
    backgroundColor: '#2d6a4f',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#2d6a4f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  calcBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#f4fbf7',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#d8f3e5'
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 10
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e9'
  },
  resultLabel: {
    fontSize: 14,
    color: '#40916c',
    fontWeight: '500'
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b4332'
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#40916c',
    fontSize: 13
  },
  tableCol: {
    fontSize: 14
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    alignItems: 'center'
  },
  cropName: {
    fontWeight: '600',
    color: '#1b4332'
  },
  cropPrice: {
    color: '#2d6a4f',
    fontWeight: '500'
  },
  inputHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#40916c',
    marginBottom: 8,
    marginTop: 5
  },
  selectorScroll: {
    flexDirection: 'row',
    marginBottom: 12
  },
  selectorBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectorBtnActive: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f'
  },
  selectorBtnText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 12
  },
  selectorBtnTextActive: {
    color: 'white'
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15
  }
});

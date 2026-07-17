import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const LABELS = {
  en: {
    title: "Agri Tools",
    tabCalc: "NPK Calculator",
    tabMandi: "Mandi Prices",
    cropLabel: "Target Crop:",
    landLabel: "Land Size:",
    unitLabel: "Unit:",
    acres: "Acres",
    bighas: "Bighas (Gujarat)",
    calculateBtn: "Calculate Fertilizer",
    reqHeader: "Required Nutrients:",
    urea: "Urea (Nitrogen Source)",
    dap: "DAP (Phosphorus Source)",
    mop: "MOP (Potassium Source)",
    searchPlaceholder: "Search Mandi or Crop...",
    mandiLocation: "Mandi Location:",
    priceRange: "Price (Per 20kg / મણ):",
    min: "Min:",
    max: "Max:",
    avg: "Avg:",
    tomato: "Tomato",
    potato: "Potato",
    corn: "Corn",
    cotton: "Cotton",
    wheat: "Wheat",
    langBtn: "ગુજરાતી"
  },
  gu: {
    title: "કૃષિ સાધનો",
    tabCalc: "ખાતર ગણતરી",
    tabMandi: "બજાર ભાવ",
    cropLabel: "વાવેતર પાક:",
    landLabel: "જમીનનું માપ:",
    unitLabel: "એકમ:",
    acres: "એકર",
    bighas: "વીઘા (ગુજરાત)",
    calculateBtn: "ખાતરની ગણતરી કરો",
    reqHeader: "જરૂરી ખાતર જથ્થો (૫૦ કિલો ગુણી):",
    urea: "યુરિયા - Urea",
    dap: "ડી.એ.પી - DAP",
    mop: "એમ.ઓ.પી - MOP",
    searchPlaceholder: "માર્કેટ યાર્ડ અથવા પાક શોધો...",
    mandiLocation: "માર્કેટ યાર્ડ:",
    priceRange: "ભાવ (૨૦ કિલો દીઠ):",
    min: "ન્યુનતમ:",
    max: "મહત્તમ:",
    avg: "સરેરાશ:",
    tomato: "ટામેટા",
    potato: "બટાકા",
    corn: "મકાઈ",
    cotton: "કપાસ",
    wheat: "ઘઉં",
    langBtn: "English"
  }
};

const NPK_DATABASE: Record<string, { n: number; p: number; k: number }> = {
  tomato: { n: 75, p: 60, k: 60 },
  potato: { n: 100, p: 80, k: 100 },
  corn: { n: 120, p: 60, k: 40 },
  cotton: { n: 80, p: 40, k: 40 },
  wheat: { n: 100, p: 50, k: 50 }
};

const MANDI_DATA = [
  { id: 0, location: "Rajkot", cropEn: "Cotton", cropGu: "કપાસ (નવો)", min: 1350, max: 1680 },
  { id: 1, location: "Rajkot", cropEn: "Groundnut", cropGu: "મગફળી", min: 1100, max: 1450 },
  { id: 2, location: "Rajkot", cropEn: "Wheat", cropGu: "ઘઉં", min: 460, max: 530 },
  { id: 3, location: "Gondal", cropEn: "Cotton", cropGu: "કપાસ (નવો)", min: 1380, max: 1710 },
  { id: 4, location: "Gondal", cropEn: "Groundnut", cropGu: "મગફળી", min: 1120, max: 1480 },
  { id: 5, location: "Gondal", cropEn: "Tomato", cropGu: "ટામેટા", min: 300, max: 850 },
  { id: 6, location: "Unjha", cropEn: "Cumin Seeds", cropGu: "જીરું", min: 9500, max: 12400 },
  { id: 7, location: "Unjha", cropEn: "Mustard Seeds", cropGu: "રાયડો", min: 950, max: 1200 },
  { id: 8, location: "Surat", cropEn: "Tomato", cropGu: "ટામેટા", min: 350, max: 900 },
  { id: 9, location: "Surat", cropEn: "Potato", cropGu: "બટાકા", min: 280, max: 480 },
  { id: 10, location: "Surat", cropEn: "Wheat", cropGu: "ઘઉં", min: 480, max: 550 }
];

export default function ToolsScreen() {
  const [activeTab, setActiveTab] = useState<'calc' | 'mandi'>('calc');
  const [lang, setLang] = useState<'en' | 'gu'>('en');

  // Calculator state
  const [crop, setCrop] = useState('tomato');
  const [landSize, setLandSize] = useState('');
  const [unit, setUnit] = useState<'acre' | 'bigha'>('acre');
  const [calcResult, setCalcResult] = useState<any | null>(null);

  // Mandi state
  const [mandiSearch, setMandiSearch] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('all');

  const labels = LABELS[lang];

  // NPK calculation logic
  const handleCalculate = () => {
    const size = parseFloat(landSize);
    if (isNaN(size) || size <= 0) {
      Alert.alert(lang === 'en' ? 'Invalid Input' : 'ખોટી વિગત', lang === 'en' ? 'Please enter a valid land size.' : 'કૃપા કરીને સાચું માપ દાખલ કરો.');
      return;
    }

    const sizeInAcres = (unit === 'bigha') ? (size / 2.5) : size;
    const baseNutrients = NPK_DATABASE[crop];

    const totalN = Math.round(baseNutrients.n * sizeInAcres);
    const totalP = Math.round(baseNutrients.p * sizeInAcres);
    const totalK = Math.round(baseNutrients.k * sizeInAcres);

    const dapBags = (totalP / 23).toFixed(1);
    const nitrogenFromDAP = (totalP / 23) * 9;
    const remainingN = Math.max(0, totalN - nitrogenFromDAP);
    const ureaBags = (remainingN / 23).toFixed(1);
    const mopBags = (totalK / 30).toFixed(1);

    setCalcResult({
      n: totalN,
      p: totalP,
      k: totalK,
      urea: ureaBags,
      dap: dapBags,
      mop: mopBags
    });
  };

  const filteredMandiData = MANDI_DATA.filter(row => {
    const cropName = lang === 'en' ? row.cropEn.toLowerCase() : row.cropGu;
    const matchesSearch = row.location.toLowerCase().includes(mandiSearch.toLowerCase()) || cropName.includes(mandiSearch);
    const matchesMandi = selectedMandi === 'all' || row.location.toLowerCase() === selectedMandi.toLowerCase();
    return matchesSearch && matchesMandi;
  });

  return (
    <View style={styles.container}>
      {/* Language / Tab header */}
      <View style={styles.headerBar}>
        <View style={styles.tabButtons}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'calc' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('calc')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'calc' && styles.activeTabBtnText]}>
              {labels.tabCalc}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'mandi' && styles.activeTabBtn]} 
            onPress={() => setActiveTab('mandi')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'mandi' && styles.activeTabBtnText]}>
              {labels.tabMandi}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLang(prev => prev === 'en' ? 'gu' : 'en')}>
          <Text style={styles.langBtnText}>{labels.langBtn}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* NPK CALCULATOR SCREEN */}
        {activeTab === 'calc' && (
          <View style={{ width: '100%' }}>
            
            {/* Input card */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>{labels.cropLabel}</Text>
              <View style={styles.selectorRow}>
                {['tomato', 'potato', 'corn', 'cotton', 'wheat'].map(item => (
                  <TouchableOpacity 
                    key={item}
                    style={[styles.selectOption, crop === item && styles.activeOption]}
                    onPress={() => setCrop(item)}
                  >
                    <Text style={[styles.optionText, crop === item && styles.activeOptionText]}>
                      {labels[item as keyof typeof labels] || item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>{labels.landLabel}</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                placeholder="e.g. 5"
                value={landSize}
                onChangeText={setLandSize}
              />

              <Text style={styles.inputLabel}>{labels.unitLabel}</Text>
              <View style={styles.unitRow}>
                <TouchableOpacity 
                  style={[styles.unitBtn, unit === 'acre' && styles.activeUnitBtn]}
                  onPress={() => setUnit('acre')}
                >
                  <Text style={[styles.unitText, unit === 'acre' && styles.activeUnitText]}>{labels.acres}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.unitBtn, unit === 'bigha' && styles.activeUnitBtn]}
                  onPress={() => setUnit('bigha')}
                >
                  <Text style={[styles.unitText, unit === 'bigha' && styles.activeUnitText]}>{labels.bighas}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate}>
                <FontAwesome name="check-circle" size={18} color="#ffffff" />
                <Text style={styles.calcBtnText}>{labels.calculateBtn}</Text>
              </TouchableOpacity>
            </View>

            {/* Results card */}
            {calcResult && (
              <View style={styles.resultCard}>
                <Text style={styles.cardHeader}>{labels.reqHeader}</Text>
                
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutLabel}>Nitrogen (N):</Text>
                  <Text style={styles.nutVal}>{calcResult.n} kg</Text>
                </View>
                <View style={styles.nutrientRow}>
                  <Text style={styles.nutLabel}>Phosphorus (P):</Text>
                  <Text style={styles.nutVal}>{calcResult.p} kg</Text>
                </View>
                <View style={[styles.nutrientRow, { borderBottomWidth: 0, marginBottom: 15 }]}>
                  <Text style={styles.nutLabel}>Potassium (K):</Text>
                  <Text style={styles.nutVal}>{calcResult.k} kg</Text>
                </View>

                {/* Commercial Bags */}
                <View style={styles.bagCard}>
                  <View style={styles.bagRow}>
                    <Text style={styles.bagLabel}>{labels.urea}:</Text>
                    <Text style={styles.bagVal}>{calcResult.urea} Bags</Text>
                  </View>
                  <View style={styles.bagRow}>
                    <Text style={styles.bagLabel}>{labels.dap}:</Text>
                    <Text style={styles.bagVal}>{calcResult.dap} Bags</Text>
                  </View>
                  <View style={[styles.bagRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.bagLabel}>{labels.mop}:</Text>
                    <Text style={styles.bagVal}>{calcResult.mop} Bags</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* APMC MANDI PRICE TRACKER */}
        {activeTab === 'mandi' && (
          <View style={{ width: '100%' }}>
            
            {/* Search and Filters */}
            <View style={styles.filterCard}>
              <View style={styles.searchRow}>
                <FontAwesome name="search" size={16} color="#74c69d" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={labels.searchPlaceholder}
                  placeholderTextColor="#74c69d"
                  value={mandiSearch}
                  onChangeText={setMandiSearch}
                />
              </View>

              {/* Mandi select options */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterMandiScroll}>
                {['all', 'rajkot', 'gondal', 'unjha', 'surat'].map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.mandiOption, selectedMandi === m && styles.activeMandiOption]}
                    onPress={() => setSelectedMandi(m)}
                  >
                    <Text style={[styles.mandiOptionText, selectedMandi === m && styles.activeMandiOptionText]}>
                      {m === 'all' ? (lang === 'en' ? 'All Mandis' : 'બધા યાર્ડ') : m.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Price list cards */}
            <View style={styles.mandiList}>
              {filteredMandiData.map(row => {
                const avgPrice = Math.round((row.min + row.max) / 2);
                // Calculate percentage positions for visual bar graph (local scale based on max rate of crop)
                const minPercent = (row.min / row.max) * 100;
                const avgPercent = (avgPrice / row.max) * 100;

                return (
                  <View key={row.id} style={styles.mandiCard}>
                    <View style={styles.mandiCardHeader}>
                      <Text style={styles.mandiLocation}>{row.location.toUpperCase()}</Text>
                      <Text style={styles.mandiCrop}>{lang === 'en' ? row.cropEn : row.cropGu}</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>{lang === 'en' ? 'Min' : 'ન્યુનતમ'}</Text>
                        <Text style={styles.priceVal}>₹{row.min}</Text>
                      </View>
                      <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>{lang === 'en' ? 'Max' : 'મહત્તમ'}</Text>
                        <Text style={[styles.priceVal, { color: '#cc3300' }]}>₹{row.max}</Text>
                      </View>
                      <View style={[styles.priceItem, styles.avgPriceItem]}>
                        <Text style={[styles.priceLabel, { color: '#1b4332' }]}>{lang === 'en' ? 'Avg' : 'સરેરાશ'}</Text>
                        <Text style={[styles.priceVal, { color: '#1b4332', fontWeight: '800' }]}>₹{avgPrice}</Text>
                      </View>
                    </View>

                    {/* Interactive Horizontal Bar Graph */}
                    <View style={styles.chartContainer}>
                      <View style={styles.chartTrack}>
                        {/* Range Bar (from Min to Max) */}
                        <View style={[styles.chartRangeBar, { left: `${minPercent}%`, width: `${100 - minPercent}%` }]} />
                        {/* Average Marker Dot */}
                        <View style={[styles.chartAvgDot, { left: `${avgPercent}%` }]} />
                      </View>
                      <View style={styles.chartLabels}>
                        <Text style={styles.chartLabelText}>0</Text>
                        <Text style={[styles.chartLabelText, { color: '#2d6a4f' }]}>{lang === 'en' ? 'Avg' : 'સરેરાશ'} (₹{avgPrice})</Text>
                        <Text style={styles.chartLabelText}>₹{row.max}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4fbf7',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1.5,
    borderBottomColor: '#d8f3dc',
  },
  tabButtons: {
    flexDirection: 'row',
    backgroundColor: '#e2f3e8',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  activeTabBtn: {
    backgroundColor: '#1b4332',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1b4332',
  },
  activeTabBtnText: {
    color: '#ffffff',
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
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#d8f3dc',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  selectOption: {
    backgroundColor: '#f4fbf7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  activeOption: {
    backgroundColor: '#1b4332',
    borderColor: '#1b4332',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d6a4f',
  },
  activeOptionText: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#f4fbf7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b7e4c7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1b4332',
    marginBottom: 20,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  unitBtn: {
    flex: 1,
    backgroundColor: '#f4fbf7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  activeUnitBtn: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f',
  },
  unitText: {
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  activeUnitText: {
    color: '#ffffff',
  },
  calcBtn: {
    backgroundColor: '#1b4332',
    paddingVertical: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calcBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#95d5b2',
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 15,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f4fbf7',
  },
  nutLabel: {
    color: '#52b788',
    fontWeight: '600',
  },
  nutVal: {
    color: '#1b4332',
    fontWeight: 'bold',
  },
  bagCard: {
    backgroundColor: '#f4fbf7',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#d8f3dc',
  },
  bagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d8f3dc',
  },
  bagLabel: {
    color: '#2d6a4f',
    fontWeight: 'bold',
  },
  bagVal: {
    color: '#1b4332',
    fontWeight: 'bold',
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#d8f3dc',
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4fbf7',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#b7e4c7',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#1b4332',
    fontSize: 14,
  },
  filterMandiScroll: {
    marginTop: 12,
    flexDirection: 'row',
  },
  mandiOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f4fbf7',
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#b7e4c7',
  },
  activeMandiOption: {
    backgroundColor: '#1b4332',
    borderColor: '#1b4332',
  },
  mandiOptionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  activeMandiOptionText: {
    color: '#ffffff',
  },
  mandiList: {
    gap: 12,
  },
  mandiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#d8f3dc',
  },
  mandiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f4fbf7',
    paddingBottom: 8,
    marginBottom: 12,
  },
  mandiLocation: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#74c69d',
  },
  mandiCrop: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1b4332',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceItem: {
    alignItems: 'center',
  },
  avgPriceItem: {
    backgroundColor: '#f4fbf7',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 10,
    color: '#52b788',
    fontWeight: '600',
    marginBottom: 4,
  },
  priceVal: {
    fontSize: 15,
    color: '#666',
    fontWeight: 'bold',
  },
  chartContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f4fbf7',
  },
  chartTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2f3e8',
    position: 'relative',
    marginBottom: 8,
  },
  chartRangeBar: {
    height: '100%',
    backgroundColor: '#74c69d',
    borderRadius: 3,
    position: 'absolute',
  },
  chartAvgDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1b4332',
    position: 'absolute',
    top: -3,
    marginLeft: -6,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabelText: {
    fontSize: 10,
    color: '#52b788',
    fontWeight: '600',
  },
});

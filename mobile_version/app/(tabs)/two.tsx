import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import pesticidesData from '../../assets/pesticides.json';

import classNamesData from '../../assets/class_names.json';

const BACKEND_URL = 'https://cropbuddy-rho.vercel.app';

export default function ClassifierScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [remedies, setRemedies] = useState<any[]>([]);
  const [lang, setLang] = useState<'en' | 'gu'>('en');

  // Request camera and photo library permissions
  const selectImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Camera permissions are required to scan leaves.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Gallery permissions are required to upload photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
        setBase64(result.assets[0].base64 || null);
        setResult(null);
        setRemedies([]);
      }
    } catch (error) {
      console.error('Image picking error:', error);
      Alert.alert('Error', 'Failed to capture or select image.');
    }
  };

  // Map predicted class to remedies inside local pesticides database
  const getRemediesForClass = (className: string) => {
    try {
      const lowerClass = className.toLowerCase();
      // Healthy Leaf Check
      if (lowerClass.includes('healthy')) {
        return [{ en: "Plant leaf is healthy! Continue standard watering and pruning.", gu: "છોડ તંદુરસ્ત છે! સામાન્ય કાળજી ચાલુ રાખો." }];
      }

      // Check category mapping (borer, sucking pests, funguses)
      const list = [];
      if (lowerClass.includes('virus') || lowerClass.includes('curl') || lowerClass.includes('mite') || lowerClass.includes('aphid') || lowerClass.includes('whitefly')) {
        // Sucking pests remedies (Aphids, Jassids, Mites, Whitefly)
        const suckingCat = pesticidesData.commonPesticides[1];
        if (lowerClass.includes('whitefly') && suckingCat.subCategories) {
          const whiteflyList = suckingCat.subCategories[1].medicines;
          whiteflyList.forEach((med: any) => {
            list.push({ en: `${med.nameEnglish} (Dose: ${med.recommendedDosage})`, gu: `${med.nameGujarati} (ડોઝ: ${med.recommendedDosage})` });
          });
        } else if (suckingCat.subCategories) {
          const generalSucking = suckingCat.subCategories[0].medicines;
          generalSucking.forEach((med: any) => {
            list.push({ en: `${med.nameEnglish} (Dose: ${med.recommendedDosage})`, gu: `${med.nameGujarati} (ડોઝ: ${med.recommendedDosage})` });
          });
        }
      } else {
        // Fungal diseases remedies (Blights, spots, mold, rusts)
        const copperOxy = { en: "Copper Oxychloride 50% WP (Dose: 40g per 15L water)", gu: "કોપર ઓક્ઝીક્લોરાઇડ ૫૦% ડબલ્યુપી (ડોઝ: ૪૦ ગ્રામ પ્રતિ ૧૫ લિટર પાણી)" };
        const carbendazim = { en: "Carbendazim 50% WP (Dose: 15g per 15L water)", gu: "કાર્બેન્ડાઝીમ ૫૦% ડબલ્યુપી (ડોઝ: ૧૫ ગ્રામ પ્રતિ ૧૫ લિટર પાણી)" };
        list.push(copperOxy, carbendazim);
      }

      return list.length > 0 ? list : [{ en: "Standard broad-spectrum organic fungicide treatment.", gu: "સામાન્ય બ્રોડ-સ્પેક્ટ્રમ સેન્દ્રીય ફૂગનાશક સારવાર." }];
    } catch (e) {
      console.warn("Remedy parsing failed, returning fallback:", e);
      return [{ en: "Consult nearest agronomist or spray standard Copper Oxychloride.", gu: "નજીકના કૃષિ નિષ્ણાતનો સંપર્ક કરો અથવા કોપર ઓક્ઝીક્લોરાઇડનો છંટકાવ કરો." }];
    }
  };

  // Perform Vercel API classification request
  const uploadAndAnalyze = async () => {
    if (!base64) {
      Alert.alert('No Image', 'Please capture or choose a photo first.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/predict_custom`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: `data:image/jpeg;base64,${base64}`,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned error code ' + response.status);
      }

      const data = await response.json();
      if (data.predictions && data.predictions.length > 0) {
        const topPrediction = data.predictions[0]; // Already sorted { class, confidence } object from Vercel!
        setResult(topPrediction);
        
        // Load remedies list
        const loadedRemedies = getRemediesForClass(topPrediction.class);
        setRemedies(loadedRemedies);
      } else {
        throw new Error('Empty predictions list returned.');
      }
    } catch (error: any) {
      console.error('Classification error:', error);
      Alert.alert('Analysis Failed', 'Could not communicate with Vercel API. Make sure server is online.');
    } finally {
      setLoading(false);
    }
  };

  const getCleanLabel = (rawName: string) => {
    return rawName.replace(/___/g, ' - ').replace(/_/g, ' ');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.langContainer}>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLang(prev => prev === 'en' ? 'gu' : 'en')}>
          <Text style={styles.langBtnText}>{lang === 'en' ? 'ગુજરાતી' : 'English'}</Text>
        </TouchableOpacity>
      </View>

      {/* Camera and Gallery buttons */}
      <View style={styles.photoSourceRow}>
        <TouchableOpacity style={styles.sourceBtn} onPress={() => selectImage(true)}>
          <FontAwesome name="camera" size={20} color="#ffffff" />
          <Text style={styles.sourceBtnText}>{lang === 'en' ? 'Use Camera' : 'કેમેરા વાપરો'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sourceBtn, { backgroundColor: '#2d6a4f' }]} onPress={() => selectImage(false)}>
          <FontAwesome name="image" size={20} color="#ffffff" />
          <Text style={styles.sourceBtnText}>{lang === 'en' ? 'Open Gallery' : 'ગેલેરી ખોલો'}</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview Box */}
      <View style={styles.previewContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderBox}>
            <FontAwesome name="leaf" size={48} color="#74c69d" />
            <Text style={styles.placeholderText}>
              {lang === 'en' ? 'No crop image selected' : 'કોઈ પાકનો ફોટો પસંદ કરેલ નથી'}
            </Text>
          </View>
        )}
      </View>

      {/* Trigger Button */}
      {image && !loading && (
        <TouchableOpacity style={styles.analyzeBtn} onPress={uploadAndAnalyze}>
          <FontAwesome name="search" size={18} color="#ffffff" />
          <Text style={styles.analyzeBtnText}>
            {lang === 'en' ? 'Analyze Crop Disease' : 'પાક રોગ ઓળખો'}
          </Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1b4332" />
          <Text style={styles.loadingText}>
            {lang === 'en' ? 'Sending to Vercel API...' : 'ફાયરબેઝ/વરસેલ સર્વર લોડ થઈ રહ્યું છે...'}
          </Text>
        </View>
      )}

      {/* Classification Results */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.cardHeader}>{lang === 'en' ? 'Diagnosis Result' : 'નિદાન પરિણામ'}</Text>
          
          <Text style={styles.diseaseName}>
            {getCleanLabel(result.class)}
          </Text>

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>{lang === 'en' ? 'Confidence level:' : 'ચોકસાઈ દર:'}</Text>
            <Text style={styles.confidenceValue}>{(result.confidence * 100).toFixed(1)}%</Text>
          </View>

          {/* Remedies Box */}
          <View style={styles.remedyBox}>
            <Text style={styles.remedyHeader}>
              {lang === 'en' ? '💊 Recommended Treatments' : '💊 ભલામણ કરેલ સારવાર અને દવાઓ'}
            </Text>
            {remedies.map((item, idx) => (
              <View key={idx} style={styles.remedyItem}>
                <FontAwesome name="check-circle" size={16} color="#2d6a4f" style={styles.remedyCheck} />
                <Text style={styles.remedyText}>
                  {lang === 'en' ? item.en : item.gu}
                </Text>
              </View>
            ))}
          </View>
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
    marginBottom: 15,
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
  photoSourceRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  sourceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1b4332',
    paddingVertical: 14,
    borderRadius: 12,
  },
  sourceBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d8f3dc',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    color: '#52b788',
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeBtn: {
    width: '100%',
    backgroundColor: '#1b4332',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  analyzeBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingBox: {
    marginVertical: 20,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#1b4332',
    fontWeight: '600',
    fontSize: 14,
  },
  resultCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#b7e4c7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#52b788',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1b4332',
    marginBottom: 10,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f4fbf7',
    marginBottom: 15,
  },
  confidenceLabel: {
    color: '#52b788',
    fontWeight: '600',
  },
  confidenceValue: {
    color: '#1b4332',
    fontWeight: 'bold',
  },
  remedyBox: {
    backgroundColor: '#f4fbf7',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#d8f3dc',
  },
  remedyHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 12,
  },
  remedyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  remedyCheck: {
    marginTop: 2,
    marginRight: 8,
  },
  remedyText: {
    flex: 1,
    fontSize: 13,
    color: '#2d6a4f',
    lineHeight: 18,
  },
});

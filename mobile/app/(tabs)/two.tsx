import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { useRouter } from 'expo-router';

const CROP_OPTIONS = [
  { label: 'All Supported Crops (બધા)', value: 'all' },
  { label: 'Apple (સફરજન)', value: 'apple' },
  { label: 'Blueberry (બ્લુબેરી)', value: 'blueberry' },
  { label: 'Cherry (ચેરી)', value: 'cherry' },
  { label: 'Corn (મકાઈ)', value: 'corn' },
  { label: 'Grape (દ્રાક્ષ)', value: 'grape' },
  { label: 'Orange (નારંગી)', value: 'orange' },
  { label: 'Peach (પીચ)', value: 'peach' },
  { label: 'Pepper Bell (શિમલા મરચા)', value: 'pepper' },
  { label: 'Potato (બટાકા)', value: 'potato' },
  { label: 'Raspberry (રાસ્પબેરી)', value: 'raspberry' },
  { label: 'Soybean (સોયાબીન)', value: 'soybean' },
  { label: 'Squash (કોળુ)', value: 'squash' },
  { label: 'Strawberry (સ્ટ્રોબેરી)', value: 'strawberry' },
  { label: 'Tomato (ટામેટા)', value: 'tomato' }
];

export default function TabTwoScreen() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<'leaf' | 'bottle' | 'soil'>('leaf');
  const [lang, setLang] = useState<'en' | 'gu'>('gu');
  
  // Server configuration for LAN testing
  const [serverIp, setServerIp] = useState<string>('192.168.29.18:3000');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Leaf Diagnostic States
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [leafImage, setLeafImage] = useState<{ uri: string; base64?: string } | null>(null);
  const [isLeafLoading, setIsLeafLoading] = useState<boolean>(false);
  const [leafResult, setLeafResult] = useState<{
    crop: string;
    condition: string;
    treatment: string;
    rawText: string;
  } | null>(null);

  // Bottle Scanner States
  const [bottleImage, setBottleImage] = useState<{ uri: string; base64?: string } | null>(null);
  const [isBottleLoading, setIsBottleLoading] = useState<boolean>(false);
  const [bottleResult, setBottleResult] = useState<{
    chemicalName: string;
    category: string;
    dosage: string;
    precautions: string[];
  } | null>(null);

  // Soil Scanner States
  const [soilImage, setSoilImage] = useState<{ uri: string; base64?: string } | null>(null);
  const [isSoilLoading, setIsSoilLoading] = useState<boolean>(false);
  const [soilResult, setSoilResult] = useState<{
    soilType: string;
    explanation: string;
  } | null>(null);

  // Text-To-Speech Narrator using expo-speech
  const speakText = (text: string, locale: 'en' | 'gu') => {
    Speech.stop();
    Speech.speak(text, {
      language: locale === 'en' ? 'en-US' : 'gu-IN',
      rate: 0.9,
    });
  };

  // Image Selection Utility
  const handleSelectImage = async (mode: 'leaf' | 'bottle' | 'soil', useCamera = false) => {
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        lang === 'en' ? "Permission Denied" : "પરવાનગી નામંજૂર",
        lang === 'en' ? "Camera and Photos permissions are required." : "કેમેરા અને ગેલેરી પરવાનગી જરૂરી છે."
      );
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (mode === 'leaf') {
        setLeafImage({ uri: asset.uri, base64: asset.base64 || undefined });
        setLeafResult(null);
      } else if (mode === 'bottle') {
        setBottleImage({ uri: asset.uri, base64: asset.base64 || undefined });
        setBottleResult(null);
      } else {
        setSoilImage({ uri: asset.uri, base64: asset.base64 || undefined });
        setSoilResult(null);
      }
    }
  };

  // Leaf Prediction API Trigger
  const handleAnalyzeLeaf = async () => {
    if (!leafImage?.base64) {
      Alert.alert(
        lang === 'en' ? "No Image" : "કોઈ ફોટો નથી",
        lang === 'en' ? "Please capture or choose a leaf image first." : "કૃપા કરીને પર્ણનો ફોટો પસંદ કરો."
      );
      return;
    }

    setIsLeafLoading(true);
    try {
      // Connect to the local server
      const url = `http://${serverIp}/api/predict_custom`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: `data:image/jpeg;base64,${leafImage.base64}` })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      // Let's ask Gemini Chatbot via Server to summarize predictions and recommend treatments!
      const chatUrl = `http://${serverIp}/api/chat`;
      const chatRes = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `The crop leaf was diagnosed. Scores list: ${JSON.stringify(data.predictions)}. Selected Crop: ${selectedCrop}. Provide the predicted condition (healthy or diseased), details about it, and list safety/fungicide spray recommendations. Keep the output clean and list it separately for English and Gujarati.`
        })
      });

      if (!chatRes.ok) {
        throw new Error("Diagnosis AI summarizer failed.");
      }

      const chatData = await chatRes.json();
      const rawText = chatData.reply;

      setLeafResult({
        crop: selectedCrop === 'all' ? 'Detecting...' : selectedCrop.toUpperCase(),
        condition: "Diagnosed Condition",
        treatment: rawText,
        rawText: rawText
      });
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Diagnosis Error",
        `Failed to reach server: ${err.message}. Please verify the Server IP in settings.`
      );
    } finally {
      setIsLeafLoading(false);
    }
  };

  // OCR Label Scanner via Gemini Vision on Backend
  const handleScanLabel = async () => {
    if (!bottleImage?.base64) {
      Alert.alert(
        lang === 'en' ? "No Image" : "કોઈ ફોટો નથી",
        lang === 'en' ? "Please capture or choose a bottle label image first." : "કૃપા કરીને બોટલ લેબલનો ફોટો પસંદ કરો."
      );
      return;
    }

    setIsBottleLoading(true);
    try {
      const url = `http://${serverIp}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Analyze this pesticide label image. Extract the chemical active ingredient name (chemicalName), category/type (Fungicide or Insecticide or Herbicide), recommended dosage per liter of water, and list 3 key safety precautions. Return the result strictly in this JSON format: {\"chemicalName\":\"...\",\"category\":\"...\",\"dosage\":\"...\",\"precautions\":[\"...\",\"...\"]}"
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      const jsonStart = data.reply.indexOf('{');
      const jsonEnd = data.reply.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Could not parse label JSON details from model output.");
      }

      const parsedResult = JSON.parse(data.reply.substring(jsonStart, jsonEnd + 1));
      setBottleResult({
        chemicalName: parsedResult.chemicalName || "Unknown Chemical",
        category: parsedResult.category || "General Pesticide",
        dosage: parsedResult.dosage || "As per guidelines",
        precautions: parsedResult.precautions || []
      });

    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Scanner Error",
        `Failed to reach server: ${err.message}. Please verify the Server IP in settings.`
      );
    } finally {
      setIsBottleLoading(false);
    }
  };

  // Soil Classifier via Gemini Vision on Backend
  const handleAnalyzeSoil = async () => {
    if (!soilImage?.base64) {
      Alert.alert(
        lang === 'en' ? "No Image" : "કોઈ ફોટો નથી",
        lang === 'en' ? "Please capture or choose a soil image first." : "કૃપા કરીને માટીનો ફોટો પસંદ કરો."
      );
      return;
    }

    setIsSoilLoading(true);
    try {
      const url = `http://${serverIp}/api/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Analyze this soil photo. Identify which of these Indian soil types is in the picture: alluvial, black, red, laterite, or desert. Also give a short explanation of its properties. Return the result strictly in this JSON format: {\"soilType\":\"alluvial | black | red | laterite | desert\",\"explanation\":\"...\"}"
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      const jsonStart = data.reply.indexOf('{');
      const jsonEnd = data.reply.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Could not parse soil JSON details from model output.");
      }

      const parsedResult = JSON.parse(data.reply.substring(jsonStart, jsonEnd + 1));
      setSoilResult({
        soilType: parsedResult.soilType || "alluvial",
        explanation: parsedResult.explanation || "Alluvial clayey soil."
      });

    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Soil Classifier Error",
        `Failed to reach server: ${err.message}. Please verify the Server IP in settings.`
      );
    } finally {
      setIsSoilLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Selector Header */}
      <View style={styles.modeTabs}>
        <TouchableOpacity 
          style={[styles.modeTab, activeMode === 'leaf' && styles.modeTabActive]}
          onPress={() => {
            setActiveMode('leaf');
            Speech.stop();
          }}
        >
          <Text style={[styles.modeTabText, activeMode === 'leaf' && styles.modeTabTextActive]}>
            {lang === 'en' ? "Leaf Diagnostic" : "પર્ણ રોગ નિદાન"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeTab, activeMode === 'bottle' && styles.modeTabActive]}
          onPress={() => {
            setActiveMode('bottle');
            Speech.stop();
          }}
        >
          <Text style={[styles.modeTabText, activeMode === 'bottle' && styles.modeTabTextActive]}>
            {lang === 'en' ? "Bottle Scanner" : "બોટલ સ્કેનર"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modeTab, activeMode === 'soil' && styles.modeTabActive]}
          onPress={() => {
            setActiveMode('soil');
            Speech.stop();
          }}
        >
          <Text style={[styles.modeTabText, activeMode === 'soil' && styles.modeTabTextActive]}>
            {lang === 'en' ? "Soil Scanner" : "જમીન સ્કેનર"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Server IP Settings Toggle */}
        <TouchableOpacity 
          style={styles.settingsHeader} 
          onPress={() => setShowSettings(!showSettings)}
        >
          <Ionicons name="settings-sharp" size={16} color="#40916c" />
          <Text style={styles.settingsHeaderText}>
            {lang === 'en' ? "Developer Connection Settings" : "ડેવલપર કનેક્શન સેટિંગ્સ"}
          </Text>
          <Ionicons 
            name={showSettings ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#40916c" 
          />
        </TouchableOpacity>

        {showSettings && (
          <View style={styles.settingsBox}>
            <Text style={styles.settingsLabel}>Local Server IP & Port (WiFi LAN):</Text>
            <TextInput
              style={styles.settingsInput}
              value={serverIp}
              onChangeText={setServerIp}
              placeholder="e.g. 192.168.29.18:3000"
            />
            <Text style={styles.settingsNote}>
              Note: Ensure your phone and computer are on the same WiFi network.
            </Text>
          </View>
        )}

        {activeMode === 'leaf' ? (
          /* LEAF DIAGNOSTIC INTERFACE */
          <View style={styles.card}>
            {/* Crop Selector Header */}
            <Text style={styles.fieldLabel}>{lang === 'en' ? "Select Target Crop:" : "લક્ષ્ય પાક પસંદ કરો:"}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropList}>
              {CROP_OPTIONS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[styles.cropBadge, selectedCrop === item.value && styles.cropBadgeActive]}
                  onPress={() => setSelectedCrop(item.value)}
                >
                  <Text style={[styles.cropBadgeText, selectedCrop === item.value && styles.cropBadgeTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Photo upload container */}
            <TouchableOpacity 
              style={styles.imagePlaceholder} 
              onPress={() => handleSelectImage('leaf', false)}
            >
              {leafImage ? (
                <Image source={{ uri: leafImage.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholderInner}>
                  <Ionicons name="image" size={50} color="#b7e4c7" />
                  <Text style={styles.placeholderText}>
                    {lang === 'en' ? "Choose or Capture Leaf Photo" : "પાંદડાનો ફોટો પસંદ કરો"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.cameraRow}>
              <TouchableOpacity 
                style={styles.actionBtnSecondary} 
                onPress={() => handleSelectImage('leaf', true)}
              >
                <Ionicons name="camera" size={20} color="#1b4332" />
                <Text style={styles.actionBtnSecondaryText}>{lang === 'en' ? "Use Camera" : "કેમેરો વાપરો"}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionBtnSecondary} 
                onPress={() => handleSelectImage('leaf', false)}
              >
                <Ionicons name="images" size={20} color="#1b4332" />
                <Text style={styles.actionBtnSecondaryText}>{lang === 'en' ? "Gallery" : "ગેલેરી"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.actionBtnPrimary} 
              onPress={handleAnalyzeLeaf}
              disabled={isLeafLoading}
            >
              {isLeafLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="shield-checkmark" size={22} color="white" />
                  <Text style={styles.actionBtnPrimaryText}>
                    {lang === 'en' ? "Analyze Leaf Health" : "પાક રોગ નિદાન કરો"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {leafResult && (
              <View style={styles.resultsBox}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    {lang === 'en' ? "Analysis Result" : "રોગ નિદાન પરિણામ"}
                  </Text>
                  <View style={styles.speakerRow}>
                    <TouchableOpacity 
                      style={styles.speakerBtn}
                      onPress={() => speakText(leafResult.rawText, 'en')}
                    >
                      <Ionicons name="volume-medium-sharp" size={16} color="white" />
                      <Text style={styles.speakerBtnText}>EN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.speakerBtn, { backgroundColor: '#40916c' }]}
                      onPress={() => speakText(leafResult.rawText, 'gu')}
                    >
                      <Ionicons name="volume-medium-sharp" size={16} color="white" />
                      <Text style={styles.speakerBtnText}>GJ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.speakerBtn, { backgroundColor: '#d90429' }]}
                      onPress={() => Speech.stop()}
                    >
                      <Ionicons name="stop" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.resultDetailsText}>{leafResult.treatment}</Text>
              </View>
            )}
          </View>
        ) : activeMode === 'bottle' ? (
          /* PESTICIDE BOTTLE SCANNER INTERFACE */
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.imagePlaceholder} 
              onPress={() => handleSelectImage('bottle', false)}
            >
              {bottleImage ? (
                <Image source={{ uri: bottleImage.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholderInner}>
                  <Ionicons name="barcode" size={50} color="#b7e4c7" />
                  <Text style={styles.placeholderText}>
                    {lang === 'en' ? "Take Photo of Bottle Label" : "દવાની બોટલનો ફોટો લો"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.cameraRow}>
              <TouchableOpacity 
                style={styles.actionBtnSecondary} 
                onPress={() => handleSelectImage('bottle', true)}
              >
                <Ionicons name="camera" size={20} color="#1b4332" />
                <Text style={styles.actionBtnSecondaryText}>{lang === 'en' ? "Use Camera" : "કેમેરો વાપરો"}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionBtnSecondary} 
                onPress={() => handleSelectImage('bottle', false)}
              >
                <Ionicons name="images" size={20} color="#1b4332" />
                <Text style={styles.actionBtnSecondaryText}>{lang === 'en' ? "Gallery" : "ગેલેરી"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.actionBtnPrimary} 
              onPress={handleScanLabel}
              disabled={isBottleLoading}
            >
              {isBottleLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="scan-circle" size={22} color="white" />
                  <Text style={styles.actionBtnPrimaryText}>
                    {lang === 'en' ? "Scan & Read Label" : "બોટલ લેબલ સ્કેન કરો"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {bottleResult && (
              <View style={styles.resultsBox}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    {lang === 'en' ? "Pesticide Bottle Details" : "દવાની બોટલ વિગતો"}
                  </Text>
                  
                  <View style={styles.speakerRow}>
                    <TouchableOpacity 
                      style={styles.speakerBtn}
                      onPress={() => speakText(`Chemical is ${bottleResult.chemicalName}. Category ${bottleResult.category}. Safe recommended dosage is ${bottleResult.dosage}.`, 'en')}
                    >
                      <Ionicons name="volume-medium-sharp" size={16} color="white" />
                      <Text style={styles.speakerBtnText}>EN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.speakerBtn, { backgroundColor: '#40916c' }]}
                      onPress={() => speakText(`દવાનું નામ ${bottleResult.chemicalName}. પ્રકાર ${bottleResult.category}. ભલામણ કરેલ માત્રા છે ${bottleResult.dosage}.`, 'gu')}
                    >
                      <Ionicons name="volume-medium-sharp" size={16} color="white" />
                      <Text style={styles.speakerBtnText}>GJ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.speakerBtn, { backgroundColor: '#d90429' }]}
                      onPress={() => Speech.stop()}
                    >
                      <Ionicons name="stop" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>{lang === 'en' ? "Chemical Name:" : "રાસાયણિક તત્વ:"}</Text>
                  <Text style={styles.resultItemVal}>{bottleResult.chemicalName}</Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>{lang === 'en' ? "Category:" : "દવાનો પ્રકાર:"}</Text>
                  <Text style={styles.resultItemVal}>{bottleResult.category}</Text>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>{lang === 'en' ? "Safe Recommended Dosage:" : "ભલામણ કરેલ સુરક્ષિત માત્રા:"}</Text>
                  <Text style={styles.resultItemVal}>{bottleResult.dosage}</Text>
                </View>

                {bottleResult.precautions && bottleResult.precautions.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.resultItemLabel}>{lang === 'en' ? "Precautions:" : "રાખવાની સાવચેતીઓ:"}</Text>
                    {bottleResult.precautions.map((prec, i) => (
                      <Text key={i} style={styles.precautionText}>• {prec}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          /* SOIL SCANNER INTERFACE */
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.imagePlaceholder} 
              onPress={() => handleSelectImage('soil', false)}
            >
              {soilImage ? (
                <Image source={{ uri: soilImage.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholderInner}>
                  <Ionicons name="earth" size={50} color="#b7e4c7" />
                  <Text style={styles.placeholderText}>
                    {lang === 'en' ? "Take Photo of Soil" : "જમીનનો ફોટો લો"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.cameraRow}>
              <TouchableOpacity 
                style={styles.actionBtnSecondary} 
                onPress={() => handleSelectImage('soil', true)}
              >
                <Ionicons name="camera" size={20} color="#1b4332" />
                <Text style={styles.actionBtnSecondaryText}>{lang === 'en' ? "Use Camera" : "કેમેરો વાપરો"}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionBtnSecondary} 
                onPress={() => handleSelectImage('soil', false)}
              >
                <Ionicons name="images" size={20} color="#1b4332" />
                <Text style={styles.actionBtnSecondaryText}>{lang === 'en' ? "Gallery" : "ગેલેરી"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.actionBtnPrimary} 
              onPress={handleAnalyzeSoil}
              disabled={isSoilLoading}
            >
              {isSoilLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="scan-circle" size={22} color="white" />
                  <Text style={styles.actionBtnPrimaryText}>
                    {lang === 'en' ? "Analyze Soil Type" : "જમીન પ્રકાર નિદાન કરો"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {soilResult && (
              <View style={styles.resultsBox}>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsTitle}>
                    {lang === 'en' ? "Detected Soil Type" : "ઓળખાયેલ જમીનનો પ્રકાર"}
                  </Text>
                  
                  <View style={styles.speakerRow}>
                    <TouchableOpacity 
                      style={styles.speakerBtn}
                      onPress={() => speakText(`Detected soil type is ${soilResult.soilType}. ${soilResult.explanation}`, 'en')}
                    >
                      <Ionicons name="volume-medium-sharp" size={16} color="white" />
                      <Text style={styles.speakerBtnText}>EN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.speakerBtn, { backgroundColor: '#40916c' }]}
                      onPress={() => speakText(`ઓળખાયેલ જમીનનો પ્રકાર છે ${soilResult.soilType}. ${soilResult.explanation}`, 'gu')}
                    >
                      <Ionicons name="volume-medium-sharp" size={16} color="white" />
                      <Text style={styles.speakerBtnText}>GJ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.speakerBtn, { backgroundColor: '#d90429' }]}
                      onPress={() => Speech.stop()}
                    >
                      <Ionicons name="stop" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.resultItem}>
                  <Text style={styles.resultItemLabel}>{lang === 'en' ? "Soil Type:" : "જમીનનો પ્રકાર:"}</Text>
                  <Text style={styles.resultItemVal}>{soilResult.soilType.toUpperCase()}</Text>
                </View>

                <View style={{ marginTop: 10, marginBottom: 15 }}>
                  <Text style={styles.resultItemLabel}>{lang === 'en' ? "Properties / Advice:" : "ગુણધર્મો અને સલાહ:"}</Text>
                  <Text style={styles.precautionText}>{soilResult.explanation}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.actionBtnPrimary, { backgroundColor: '#40916c', marginBottom: 0 }]}
                  onPress={() => {
                    Speech.stop();
                    router.replace({
                      pathname: '/(tabs)',
                      params: { detectedSoil: soilResult.soilType }
                    });
                  }}
                >
                  <Ionicons name="calculator-outline" size={20} color="white" />
                  <Text style={styles.actionBtnPrimaryText}>
                    {lang === 'en' ? "Use in NPK Calculator" : "NPK કેલ્ક્યુલેટરમાં વાપરો"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 10
  },
  modeTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e8e8e8'
  },
  modeTabActive: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f'
  },
  modeTabText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#666'
  },
  modeTabTextActive: {
    color: 'white'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    marginBottom: 10
  },
  settingsHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#40916c'
  },
  settingsBox: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    marginBottom: 20
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1b4332',
    marginBottom: 8
  },
  settingsInput: {
    borderWidth: 1,
    borderColor: '#a5d6a7',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: '#333',
    backgroundColor: 'white'
  },
  settingsNote: {
    fontSize: 11,
    color: '#2e7d32',
    marginTop: 8
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 10
  },
  cropList: {
    flexDirection: 'row',
    marginBottom: 20,
    maxHeight: 45
  },
  cropBadge: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 34
  },
  cropBadgeActive: {
    backgroundColor: '#d8f3e5',
    borderColor: '#b7e4c7'
  },
  cropBadgeText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 12
  },
  cropBadgeTextActive: {
    color: '#1b4332'
  },
  imagePlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#b7e4c7',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
    marginBottom: 15
  },
  imagePlaceholderInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  placeholderText: {
    fontSize: 14,
    color: '#74c69d',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  cameraRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d8f3e5',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b7e4c7',
    gap: 8
  },
  actionBtnSecondaryText: {
    color: '#1b4332',
    fontWeight: 'bold',
    fontSize: 14
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    backgroundColor: '#2d6a4f',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#2d6a4f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 20
  },
  actionBtnPrimaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  resultsBox: {
    backgroundColor: '#f4fbf7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b7e4c7',
    padding: 15
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#b7e4c7',
    paddingBottom: 10,
    marginBottom: 12
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b4332'
  },
  speakerRow: {
    flexDirection: 'row',
    gap: 6
  },
  speakerBtn: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  speakerBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10
  },
  resultDetailsText: {
    fontSize: 14,
    color: '#2d6a4f',
    lineHeight: 20
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e8f5e9',
    alignItems: 'center'
  },
  resultItemLabel: {
    fontSize: 14,
    color: '#40916c',
    fontWeight: 'bold'
  },
  resultItemVal: {
    fontSize: 14,
    color: '#1b4332',
    fontWeight: '600'
  },
  precautionText: {
    fontSize: 13,
    color: '#2d6a4f',
    marginTop: 6,
    lineHeight: 18
  }
});

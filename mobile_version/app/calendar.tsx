import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

const UI_LABELS = {
  en: {
    title: "Crop Lifecycle Calendar",
    desc: "Track development milestones for different crops and view dynamic warnings about potential disease threats at each stage.",
    chooseCrop: "Select Crop:",
    stagesCount: "Development Stages",
    tomato: "Tomato (ટામેટા)",
    potato: "Potato (બટાકા)",
    corn: "Corn (મકાઈ)",
    diseaseHeader: "⚠️ Stage Specific Disease Risks:",
    activitiesHeader: "📋 Recommended Farming Operations:",
    langBtn: "ગુજરાતી",
    backBtn: "Back to Home"
  },
  gu: {
    title: "પાક સમયપત્રક આયોજક (કેલેન્ડર)",
    desc: "વાવણીથી લણણી સુધીના તબક્કાઓનું આયોજન કરો અને પાકના વિકાસ દરમિયાન રોગની સંભવિત ચેતવણીઓ મેળવો.",
    chooseCrop: "પાક પસંદ કરો:",
    stagesCount: "વિકાસ તબક્કાઓ",
    tomato: "ટામેટા - Tomato",
    potato: "બટાકા - Potato",
    corn: "મકાઈ - Corn",
    diseaseHeader: "⚠️ આ તબક્કામાં સંભવિત પાક રોગો:",
    activitiesHeader: "📋 આ તબક્કાની મુખ્ય ભલામણ કરેલ ખેતી પદ્ધતિઓ:",
    langBtn: "English",
    backBtn: "હોમ પેજ પર પાછા જાઓ"
  }
};

const CROP_STAGES_DATA = {
  tomato: [
    {
      stageNameEn: "Stage 1: Seedling & Transplant (Days 1-25)",
      stageNameGu: "તબક્કો ૧: ધરૂવાડિયું અને ફેરરોપણી (૧ થી ૨૫ દિવસ)",
      activitiesEn: "Ensure proper soil preparation, transplant seedlings on raised beds, apply light starter fertilizer rich in phosphorus, and water regularly.",
      activitiesGu: "જમીનની સારી તૈયારી કરો, ગાદી ક્યારા પર ધરૂની ફેરરોપણી કરો, ફોસ્ફરસ યુક્ત ખાતર આપો અને નિયમિત હળવું પાણી આપો.",
      diseasesEn: "Damping-off, Pythium root rot, early onset of Bacterial Spot.",
      diseasesGu: "ધરૂનો સુકારો (ડિમ્પિંગ ઓફ), પીથિયમ મૂળનો સડો, બેક્ટેરિયલ ટપકાનો રોગ."
    },
    {
      stageNameEn: "Stage 2: Vegetative Growth (Days 26-50)",
      stageNameGu: "તબક્કો ૨: વાનસ્પતિક વૃદ્ધિ (૨૬ થી ૫૦ દિવસ)",
      activitiesEn: "Stake and tie plants for structural support, prune side shoots (suckers), spray safety-checked preventive copper fungicides, apply balanced Nitrogen fertilizer.",
      activitiesGu: "છોડને ટેકો આપો (વેલા બાંધવા), વધારાની ડાળીઓની કાપણી કરો, સુરક્ષિત તાપમાન જોઈ કોપર યુક્ત ફૂગનાશકનો છંટકાવ કરો, સપ્રમાણ નાઈટ્રોજન ખાતર આપો.",
      diseasesEn: "Early Blight, Late Blight, Septoria Leaf Spot, Leaf Mold.",
      diseasesGu: "આગતરો સુકારો, પાછતરો સુકારો, સેપ્ટોરિયા પાનના ટપકા, પર્ણ ફૂગ."
    },
    {
      stageNameEn: "Stage 3: Flowering & Fruit Set (Days 51-80)",
      stageNameGu: "તબક્કો ૩: ફૂલ અને ફળ બેસવા (૫૧ થી ૮૦ દિવસ)",
      activitiesEn: "Maintain consistent soil moisture to prevent blossom end rot, spray calcium sprays if needed, monitor for whiteflies and aphids.",
      activitiesGu: "ફળમાં સડો અટકાવવા ભેજ જાળવી રાખો, કેલ્શિયમનો છંટકાવ કરવો, મોલોમશી અને સફેદ માખીનો ઉપદ્રવ ચકાસતા રહો.",
      diseasesEn: "Blossom End Rot, Tomato Yellow Leaf Curl Virus (Whiteflies vector), Spider Mites.",
      diseasesGu: "કેલ્શિયમની ખામીથી ફળનો સડો, પર્ણ વલન કોકડવો વાયરસ (સફેદ માખી દ્વારા ફેલાતો), લાલ કરોળિયા."
    },
    {
      stageNameEn: "Stage 4: Harvesting & Storage (Days 81-120)",
      stageNameGu: "તબક્કો ૪: ફળની લણણી અને સંગ્રહ (૮૧ થી ૧૨૦ દિવસ)",
      activitiesEn: "Pick mature green or red ripe tomatoes carefully, stop chemical pesticide spraying 7-10 days before picking, store in cool aerated crates.",
      activitiesGu: "પરિપક્વ લાલ કે લીલા ટામેટા કાળજીપૂર્વક ઉતારો, લણણીના ૧૦ દિવસ પહેલા દવાનો છંટકાવ બંધ કરો, ઠંડી અને હવાઉજાસવાળી જગ્યાએ સંગ્રહ કરો.",
      diseasesEn: "Late Blight fruit rot, Anthracnose, Fruit Borer damage.",
      diseasesGu: "પાછતરો સુકારો ફળનો સડો, એન્થ્રેકનોઝ (કાઢા ટપકા), ફળ કોરી ખાનાર ઇયળ."
    }
  ],
  potato: [
    {
      stageNameEn: "Stage 1: Sprouting & Emergence (Days 1-30)",
      stageNameGu: "તબક્કો ૧: ઉગાવો અને બહાર નીકળવું (૧ થી ૩૦ દિવસ)",
      activitiesEn: "Plant healthy certified seed tubers, maintain optimal field moisture, apply basal dose of DAP and Organic manure.",
      activitiesGu: "પ્રમાણિત ગુણવત્તાવાળા બિયારણ બટાકા વાવો, ખેતરમાં સારો ભેજ જાળવો, ડી.એ.પી (DAP) અને સેન્દ્રિય ખાતરનો પાયાનો ડોઝ આપો.",
      diseasesEn: "Seed piece decay, Rhizoctonia stem canker.",
      diseasesGu: "કાળા ચામડીનો રોગ, રાઈઝોક્ટોનિયા મૂળનો સડો."
    },
    {
      stageNameEn: "Stage 2: Stolon & Tuber Initiation (Days 31-60)",
      stageNameGu: "તબક્કો ૨: સ્ટોલોન અને ગાંઠો બનવી (૩૧ થી ૬૦ દિવસ)",
      activitiesEn: "Perform hilling (earthing up soil) to cover developing tubers, spray preventive systemic fungicides, ensure no water logging.",
      activitiesGu: "બટાકાને જમીનથી ઢાંકવા માટી ચડાવવાનું કામ કરો, અગમચેતી રૂપે ફૂગનાશકનો છંટકાવ કરો, ખેતરમાં પાણી ભરાવા ન દેવું.",
      diseasesEn: "Early Blight, Late Blight, Blackleg bacterial rot.",
      diseasesGu: "આગતરો સુકારો, પાછતરો સુકારો, થડનો કાળો કોહવારો."
    },
    {
      stageNameEn: "Stage 3: Tuber Bulking (Days 61-90)",
      stageNameGu: "તબક્કો ૩: બટાકાનો વિકાસ અને કદ વધવું (૬૧ થી ૯૦ દિવસ)",
      activitiesEn: "Ensure maximum potash supply, monitor weather for high humidity/low temperature which triggers blight outbreaks.",
      activitiesGu: "પોટાશ ખાતર પૂરતા પ્રમાણમાં આપો, વાદળછાયું કે ભેજવાળું હવામાન હોય ત્યારે સુકારાના ઉપદ્રવ પર ખાસ નજર રાખો.",
      diseasesEn: "Late Blight epidemic, Scab on tubers, Potato Virus Y.",
      diseasesGu: "પાછતરા સુકારાનો રોગચાળો, બટાકાની ચામડીનો ભીંગડા રોગ, પોટેટો વાયરસ Y."
    },
    {
      stageNameEn: "Stage 4: Maturation & Harvesting (Days 91-120)",
      stageNameGu: "તબક્કો ૪: પાકની પરિપક્વતા અને લણણી (૯૧ થી ૧૨૦ દિવસ)",
      activitiesEn: "Perform dehaulming (cut potato vines/foliage) 10-14 days before harvest to harden the tuber skin, harvest in dry soil.",
      activitiesGu: "લણણીના ૧૦-૧૪ દિવસ પહેલા બટાકાના વેલા કાપી નાખો (વેલા કાપણી) જેથી બટાકાની ચામડી કઠણ બને, સૂકી માટીમાં લણણી કરો.",
      diseasesEn: "Tuber rot, Fusarium dry rot, skin bruising.",
      diseasesGu: "બટાકાનો કોહવારો, ફ્યુઝેરિયમ સુકો સડો, ચામડી છોલાઈ જવી."
    }
  ],
  corn: [
    {
      stageNameEn: "Stage 1: Germination & Early Leaf stages (Days 1-25)",
      stageNameGu: "તબક્કો ૧: અંકુરણ અને પાંદડા આવવા (૧ થી ૨૫ દિવસ)",
      activitiesEn: "Sow seeds at correct depth, clear early weeds, apply light Nitrogen dosage.",
      activitiesGu: "योग્ય ઊંડાઈએ બીજની વાવણી કરો, નીંદણ નિયંત્રણ કરો, શરૂઆતનો હળવો નાઇટ્રોજન આપો.",
      diseasesEn: "Seedling blight, Pythium damping off.",
      diseasesGu: "ધરૂનો કોહવારો, પીથિયમ સુકારો."
    },
    {
      stageNameEn: "Stage 2: Rapid Vegetative growth & Tasseling (Days 26-55)",
      stageNameGu: "તબક્કો ૨: વાનસ્પતિક વૃદ્ધિ અને ચમરી આવવી (૨૬ થી ૫૫ દિવસ)",
      activitiesEn: "Apply second dose of Urea, monitor leaf undersides for rust spots, maintain irrigation during vegetative peaks.",
      activitiesGu: "બીજો યુરિયાનો ડોઝ આપો, પાંદડાની નીચે ગેરુના લાલ ટપકા ચકાસો, મકાઈના ઝડપી વિકાસના તબક્કે નિયમિત પિયત આપો.",
      diseasesEn: "Common Rust, Northern Leaf Blight, Cercospora Gray Leaf Spot.",
      diseasesGu: "ગેરુનો રોગ, ઉત્તરી પાનનો સુકારો, પર્ણ ટપકાનો ગ્રે સ્પોટ રોગ."
    },
    {
      stageNameEn: "Stage 3: Silking & Ear formation (Days 56-85)",
      stageNameGu: "તબક્કો ૩: રેશમ રેશા અને ડોડા બનવા (૫૬ થી ૮૫ દિવસ)",
      activitiesEn: "Maintain moisture at silking stage to ensure full grain filling, check for fall armyworm larvae inside whorls.",
      activitiesGu: "ડોડામાં પૂરા દાણા ભરાવવા રેશાના તબક્કે ભેજ જાળવો, પાનની વચ્ચે લશ્કરી ઇયળ (આર્મીવોર્મ) નો ઉપદ્રવ ચકાસો.",
      diseasesEn: "Common Smut, Ear rot, Stem Borer damage.",
      diseasesGu: "કોલસાનો રોગ (સ્મટ), ડોડાનો સડો, ગુલાબી ઇયળ કે કાનસલીનો ઉપદ્રવ."
    },
    {
      stageNameEn: "Stage 4: Maturity & Grain Drying (Days 86-110)",
      stageNameGu: "તબક્કો ૪: પાકની પરિપક્વતા અને દાણા સૂકવવા (૮૬ થી ૧૧૦ દિવસ)",
      activitiesEn: "Allow ears to dry on stalk until moisture is below 15-20%, harvest, shell grains and store in moisture-proof bags.",
      activitiesGu: "ડોડા સુકાઈ જાય ત્યાં સુધી ઉભા પાકમાં રહેવા દો, દાણા છૂટા કરો (લણણી) અને ભેજ રહિત કોથળાઓમાં સંગ્રહ કરો.",
      diseasesEn: "Aflatoxin mold, stalk rot.",
      diseasesGu: "ડોડાની ઝેરી ફૂગ (એફલાટોક્સિન), થડનો સડો."
    }
  ]
};

export default function CalendarScreen() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'gu'>('en');
  const [crop, setCrop] = useState<'tomato' | 'potato' | 'corn'>('tomato');

  const labels = UI_LABELS[lang];
  const stages = CROP_STAGES_DATA[crop];

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={16} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.titleText}>{labels.title}</Text>
        <TouchableOpacity style={styles.langBtn} onPress={() => setLang(prev => prev === 'en' ? 'gu' : 'en')}>
          <Text style={styles.langBtnText}>{labels.langBtn}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.descText}>{labels.desc}</Text>

        {/* Crop select options */}
        <Text style={styles.selectorTitle}>{labels.chooseCrop}</Text>
        <View style={styles.selectorRow}>
          {(['tomato', 'potato', 'corn'] as const).map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.selectOption, crop === item && styles.activeOption]}
              onPress={() => setCrop(item)}
            >
              <Text style={[styles.optionText, crop === item && styles.activeOptionText]}>
                {labels[item]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Timeline representation */}
        <View style={styles.timelineContainer}>
          {stages.map((stage, idx) => {
            const name = lang === 'en' ? stage.stageNameEn : stage.stageNameGu;
            const activities = lang === 'en' ? stage.activitiesEn : stage.activitiesGu;
            const diseases = lang === 'en' ? stage.diseasesEn : stage.diseasesGu;

            return (
              <View key={idx} style={styles.stageNode}>
                {/* Visual Line indicators */}
                <View style={styles.indicatorContainer}>
                  <View style={styles.dot}>
                    <Text style={styles.dotText}>{idx + 1}</Text>
                  </View>
                  {idx < stages.length - 1 && <View style={styles.verticalLine} />}
                </View>

                {/* Content details Card */}
                <View style={styles.card}>
                  <Text style={styles.stageTitle}>{name}</Text>

                  <Text style={styles.sectionHeader}>{labels.activitiesHeader}</Text>
                  <Text style={styles.sectionText}>{activities}</Text>

                  <View style={styles.warningBox}>
                    <Text style={styles.warningHeader}>{labels.diseaseHeader}</Text>
                    <Text style={styles.warningText}>{diseases}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
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
    paddingVertical: 15,
    backgroundColor: '#1b4332',
  },
  backBtn: {
    padding: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    flex: 1,
    marginLeft: 15,
  },
  langBtn: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#74c69d',
  },
  langBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  descText: {
    fontSize: 13,
    color: '#52b788',
    lineHeight: 18,
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b4332',
    marginBottom: 10,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 25,
  },
  selectOption: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d8f3dc',
  },
  activeOption: {
    backgroundColor: '#1b4332',
    borderColor: '#1b4332',
  },
  optionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  activeOptionText: {
    color: '#ffffff',
  },
  timelineContainer: {
    width: '100%',
  },
  stageNode: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
  },
  indicatorContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1b4332',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#95d5b2',
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#d8f3dc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1b4332',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#52b788',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
    marginBottom: 12,
  },
  warningBox: {
    backgroundColor: '#fff0f0',
    borderColor: '#ffccd5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  warningHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#d90429',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12.5,
    color: '#5c000e',
    lineHeight: 17,
  },
});

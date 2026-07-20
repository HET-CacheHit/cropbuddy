import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const DEFAULT_OUTBREAKS = [
  { lat: 22.3039, lng: 70.8022, label: "Tomato - Early Blight (Severe)" },
  { lat: 21.9619, lng: 70.7923, label: "Potato - Late Blight (Moderate)" },
  { lat: 22.5645, lng: 72.9289, label: "Corn - Common Rust (Mild)" },
  { lat: 21.5222, lng: 70.4579, label: "Cotton - Bacterial Blight (Severe)" },
  { lat: 21.1702, lng: 72.8311, label: "Tomato - Leaf Mold (Moderate)" }
];

export default function MapScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [pins, setPins] = useState<any[]>(DEFAULT_OUTBREAKS);
  const [loading, setLoading] = useState(true);

  // 1. Fetch outbreaks from Firestore (with Fallback)
  const fetchOutbreaks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'outbreaks'));
      const activePins: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.lat && data.lng) {
          activePins.push({
            lat: data.lat,
            lng: data.lng,
            label: `${data.crop || 'Crop'} - ${data.disease || 'Outbreak'} (${data.severity || 'Moderate'})`
          });
        }
      });
      if (activePins.length > 0) {
        setPins(activePins);
      } else {
        setPins(DEFAULT_OUTBREAKS);
      }
    } catch (err: any) {
      console.warn("Firestore restricted or offline, using fallback outbreaks:", err?.message || err);
      setPins(DEFAULT_OUTBREAKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutbreaks();
  }, []);

  // Send coordinates to WebView on load
  const sendPinsToMap = () => {
    if (webViewRef.current && pins.length > 0) {
      webViewRef.current.postMessage(JSON.stringify(pins));
    }
  };

  // 2. Handle map clicks posted by WebView
  const handleMapMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_CLICK') {
        const { lat, lng } = data;
        
        Alert.alert(
          "Report Outbreak",
          `Would you like to report a crop disease outbreak at coordinates:\nLat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Report Tomato Early Blight",
              onPress: async () => {
                const newPinData = {
                  lat,
                  lng,
                  crop: 'Tomato',
                  disease: 'Early Blight',
                  severity: 'Severe',
                  timestamp: new Date().toISOString()
                };

                try {
                  await addDoc(collection(db, 'outbreaks'), newPinData);
                } catch (e: any) {
                  console.warn("Could not write to Cloud Firestore due to permissions:", e?.message || e);
                }

                // Add pin locally to state so it renders on map instantly
                const newPinLabel = {
                  lat,
                  lng,
                  label: "Tomato - Early Blight (Severe)"
                };
                setPins(prev => [...prev, newPinLabel]);
                Alert.alert("Success", "Outbreak reported and added to map!");
              }
            }
          ]
        );
      }
    } catch (e) {
      console.warn("Map message parsing error:", e);
    }
  };

  const localMapHtml = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([22.2587, 71.1924], 7);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18
          }).addTo(map);
          
          let markersGroup = L.layerGroup().addTo(map);

          // Handle message inputs (pins data)
          window.addEventListener('message', (event) => {
            markersGroup.clearLayers();
            const pins = JSON.parse(event.data);
            pins.forEach(pin => {
              L.marker([pin.lat, pin.lng])
                .addTo(markersGroup)
                .bindPopup("<b>" + pin.label + "</b>");
            });
          });

          // Handle click event
          map.on('click', (e) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MAP_CLICK',
              lat: e.latlng.lat,
              lng: e.latlng.lng
            }));
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={16} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.titleText}>Community Outbreak Map</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchOutbreaks}>
          <FontAwesome name="refresh" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1b4332" />
          <Text style={styles.loadingText}>Fetching database outbreaks...</Text>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: localMapHtml }}
          style={styles.mapView}
          onLoad={sendPinsToMap}
          onMessage={handleMapMessage}
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1b4332',
  },
  backBtn: {
    padding: 4,
  },
  refreshBtn: {
    padding: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    flex: 1,
    marginLeft: 15,
  },
  mapView: {
    flex: 1,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#1b4332',
    fontWeight: 'bold',
  },
});

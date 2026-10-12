import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Figtree_400Regular, Figtree_600SemiBold, Figtree_700Bold } from '@expo-google-fonts/figtree';
import { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { ProfileProvider } from './src/storage';
import Navigation from './src/navigation';
import { setCustomFontsAvailable, ThemeProvider, useTheme } from './src/theme';
import { MotionPreferenceProvider } from './src/components/Motion';
import * as SplashScreen from 'expo-splash-screen';

void SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
  console.warn('Could not keep the splash screen visible while loading.', error);
});

export default function App() {
  return (
    <ThemeProvider>
      <AppGate />
    </ThemeProvider>
  );
}

function AppGate() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_400Regular,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });
  const ready = fontsLoaded || fontError !== null;

  setCustomFontsAvailable(fontsLoaded);

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <ProfileProvider>
      <MotionPreferenceProvider>
        <AppContent />
      </MotionPreferenceProvider>
    </ProfileProvider>
  );
}

function LoadingScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.loading, { backgroundColor: colors.bg }]}>
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.loadingText, { color: colors.text }]}>Loading portfolio…</Text>
    </View>
  );
}

function AppContent() {
  const { mode } = useTheme();
  React.useEffect(() => {
    void SplashScreen.hideAsync().catch((error: unknown) => {
      console.warn('Could not hide the splash screen.', error);
    });
  }, []);
  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Navigation />
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingText: { marginTop: 12, textAlign: 'center' },
});

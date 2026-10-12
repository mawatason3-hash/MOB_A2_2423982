import React, { useState } from 'react';
import { Animated, Image, Modal, Platform, Pressable, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme, NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import SkillsScreen from './screens/SkillsScreen';
import LeadershipScreen from './screens/LeadershipScreen';
import ProjectsScreen from './screens/ProjectsScreen';
import ProjectDetailsScreen from './screens/ProjectDetailsScreen';
import ProfileEditorScreen from './screens/ProfileEditorScreen';
import AboutScreen from './screens/AboutScreen';
import { AccentName, ThemeMode, useTheme } from './theme';
import { useReducedMotionPreference } from './components/Motion';
import { useProfile } from './storage';
import { FULL_NAME } from './config';

export type ProjectsStackParams = {
  ProjectsList: undefined;
  ProjectDetails: { projectId: string };
};

export type TabParamList = {
  Home: undefined;
  Skills: undefined;
  Leadership: undefined;
  Projects: NavigatorScreenParams<ProjectsStackParams> | undefined;
  Profile: undefined;
  About: undefined;
};

export type HomeScreenProps = BottomTabScreenProps<TabParamList, 'Home'>;

const Stack = createNativeStackNavigator<ProjectsStackParams>();
const Tabs = createBottomTabNavigator<TabParamList>();

function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: keyof typeof Feather.glyphMap;
  color: string;
  size: number;
  focused: boolean;
}) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotionPreference();

  React.useEffect(() => {
    if (reduced) {
      scale.setValue(1);
      return;
    }
    Animated.spring(scale, { toValue: focused ? 1.12 : 1, useNativeDriver: Platform.OS !== 'web', speed: 30, bounciness: 4 }).start();
  }, [focused, reduced, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Feather name={name} size={size} color={color} />
    </Animated.View>
  );
}

function ProjectsStack({ onSettings, imageUri, initials }: { onSettings: () => void; imageUri: string | null; initials: string }) {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: 21, fontWeight: '700' },
        headerLeft: () => <ProfileHeaderAvatar imageUri={imageUri} initials={initials} />,
        headerRight: () => <SettingsButton onPress={onSettings} />,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="ProjectsList" component={ProjectsScreen} options={{ title: 'Projects' }} />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} options={{ title: 'Project Details' }} />
    </Stack.Navigator>
  );
}

function ProfileHeaderAvatar({ imageUri, initials }: { imageUri: string | null; initials: string }) {
  const { colors } = useTheme();
  const avatarStyle = { width: 32, height: 32, borderRadius: 16, marginRight: 10 };
  return imageUri ? (
    <Image source={{ uri: imageUri }} accessibilityLabel="Saved profile photo" style={avatarStyle} />
  ) : (
    <View accessibilityRole="image" accessibilityLabel={`Profile initials ${initials}`} style={[avatarStyle, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card2, borderColor: colors.border, borderWidth: 1 }]}>
      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}

const tabs: { name: keyof TabParamList; title: string; icon: keyof typeof Feather.glyphMap }[] = [
  { name: 'Home', title: 'Home', icon: 'home' },
  { name: 'Skills', title: 'Skills', icon: 'layers' },
  { name: 'Leadership', title: 'Leadership', icon: 'award' },
  { name: 'Projects', title: 'Projects', icon: 'briefcase' },
  { name: 'Profile', title: 'Edit profile', icon: 'edit-3' },
  { name: 'About', title: 'About', icon: 'info' },
];

function SettingsButton({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Open settings"
      style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}
    >
      <Feather name="settings" size={20} color={colors.text} />
    </Pressable>
  );
}

function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, mode, accent, setMode, setAccent } = useTheme();
  const modes: ThemeMode[] = ['dark', 'light'];
  const accents: { key: AccentName; label: string; color: string }[] = [
    { key: 'teal', label: 'Teal', color: mode === 'dark' ? '#2dd4bf' : '#0f766e' },
    { key: 'violet', label: 'Violet', color: mode === 'dark' ? '#a78bfa' : '#6d28d9' },
    { key: 'amber', label: 'Amber', color: mode === 'dark' ? '#fbbf24' : '#92400e' },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#0008' }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderColor: colors.border, borderWidth: 1, padding: 20 }}>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 16 }}>Settings</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
            {modes.map((item) => {
              const selected = item === mode;
              return (
                <Pressable
                  key={item}
                  onPress={() => setMode(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item} theme`}
                  accessibilityState={{ selected }}
                  style={{ minHeight: 44, minWidth: 90, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: selected ? colors.primary : colors.border, borderRadius: 12, backgroundColor: selected ? colors.card2 : 'transparent', marginRight: 10, marginBottom: 8 }}
                >
                  <Text style={{ color: selected ? colors.primary : colors.text, textTransform: 'capitalize' }}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10 }}>ACCENT COLOUR</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
            {accents.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => setAccent(item.key)}
                accessibilityRole="button"
                accessibilityLabel={`${item.label} accent`}
                accessibilityState={{ selected: item.key === accent }}
                style={{ minWidth: 82, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: item.key === accent ? colors.primary : colors.border, borderRadius: 12, marginRight: 8, marginBottom: 8, paddingHorizontal: 10 }}
              >
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: item.color, marginRight: 6 }} />
                <Text style={{ color: colors.text }}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Done" style={{ minHeight: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.primaryText, fontWeight: '700' }}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function Navigation() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { colors, mode } = useTheme();
  const { profile } = useProfile();
  const initials = FULL_NAME.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const themeBase = mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={{ ...themeBase, colors: { ...themeBase.colors, background: colors.bg, card: colors.card, primary: colors.primary, border: colors.border, text: colors.text } }}>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontSize: 21, fontWeight: '700' },
          headerLeft: () => <ProfileHeaderAvatar imageUri={profile.imageUri} initials={initials} />,
          headerRight: () => <SettingsButton onPress={() => setSettingsOpen(true)} />,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, minHeight: 58 },
          tabBarIcon: ({ color, size, focused }) => {
            const tab = tabs.find((item) => item.name === route.name);
            return <TabIcon name={tab?.icon ?? 'circle'} color={color} size={size} focused={focused} />;
          },
          tabBarLabel: tabs.find((item) => item.name === route.name)?.title,
          tabBarLabelStyle: { fontSize: 10.5, fontWeight: '700' },
        })}
      >
        <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Tabs.Screen name="Skills" component={SkillsScreen} options={{ title: 'Skills' }} />
        <Tabs.Screen name="Leadership" component={LeadershipScreen} options={{ title: 'Leadership' }} />
        <Tabs.Screen name="Projects" options={{ title: 'Projects', headerShown: false }}>
          {() => <ProjectsStack onSettings={() => setSettingsOpen(true)} imageUri={profile.imageUri} initials={initials} />}
        </Tabs.Screen>
        <Tabs.Screen name="Profile" component={ProfileEditorScreen} options={{ title: 'Edit profile' }} />
        <Tabs.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      </Tabs.Navigator>
      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </NavigationContainer>
  );
}

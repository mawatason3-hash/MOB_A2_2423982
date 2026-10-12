import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { getFontFamily, useTheme } from '../theme';

const nativeDriver = Platform.OS !== 'web';
const MotionPreferenceContext = createContext(true);

export function MotionPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduced(enabled);
      })
      .catch((error: unknown) => {
        console.warn('Could not read the reduced-motion setting; animations remain disabled.', error);
      });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return <MotionPreferenceContext.Provider value={reduced}>{children}</MotionPreferenceContext.Provider>;
}

export function useReducedMotionPreference() {
  return useContext(MotionPreferenceContext);
}

export function FadeInUp({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotionPreference();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    opacity.setValue(0);
    translateY.setValue(16);
    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay, useNativeDriver: nativeDriver }),
      Animated.timing(translateY, { toValue: 0, duration: 320, delay, useNativeDriver: nativeDriver }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [delay, opacity, reduced, translateY]);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

export function FadeScaleIn({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotionPreference();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (reduced) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }
    opacity.setValue(0);
    scale.setValue(0.96);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: nativeDriver }),
      Animated.timing(scale, { toValue: 1, duration: 240, useNativeDriver: nativeDriver }),
    ]).start();
  }, [opacity, reduced, scale]);

  return <Animated.View style={{ opacity, transform: [{ scale }] }}>{children}</Animated.View>;
}

export function TypeWriter({
  text,
  style,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
}) {
  const reduced = useReducedMotionPreference();
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (reduced) {
      setShown(text);
      return;
    }
    setShown('');
    if (!text.length) return;

    let characters = 0;
    const intervalMs = Math.max(1, Math.min(20, 1200 / text.length));
    const timer = setInterval(() => {
      characters += 1;
      setShown(text.slice(0, characters));
      if (characters >= text.length) clearInterval(timer);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [reduced, text]);

  return <Text style={style}>{shown}</Text>;
}

export function RotatingRoles({ roles, style }: { roles: string[]; style?: StyleProp<TextStyle> }) {
  const reduced = useReducedMotionPreference();
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduced || roles.length < 2) {
      opacity.setValue(1);
      return;
    }
    const timer = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: nativeDriver }).start(() => {
        setIndex((current) => (current + 1) % roles.length);
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: nativeDriver }).start();
      });
    }, 2000);
    return () => {
      clearInterval(timer);
      opacity.stopAnimation();
    };
  }, [opacity, reduced, roles]);

  if (!roles.length) return null;
  return (
    <Animated.Text numberOfLines={1} style={[{ color: colors.primary, opacity }, style]}>
      {roles[index % roles.length]}
    </Animated.Text>
  );
}

export function AnimatedSkillBar({ level, label, delay = 0 }: { level: number; label: string; delay?: number }) {
  const reduced = useReducedMotionPreference();
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const fill = useRef(new Animated.Value(0)).current;
  const boundedLevel = Math.max(0, Math.min(100, level));

  useEffect(() => {
    fill.stopAnimation();
    if (reduced) {
      fill.setValue(boundedLevel);
      return;
    }
    fill.setValue(0);
    Animated.timing(fill, {
      toValue: boundedLevel,
      duration: 1000,
      delay,
      useNativeDriver: false,
    }).start();
  }, [boundedLevel, delay, fill, reduced]);

  const fillWidth = fill.interpolate({
    inputRange: [0, 100],
    outputRange: [0, width],
  });

  return (
    <View>
      <Text style={{ color: colors.muted, marginBottom: 7, fontFamily: getFontFamily('body') }}>{label}</Text>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={{ height: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.border }}
      >
        <Animated.View style={{ width: fillWidth, height: 8, borderRadius: 8, backgroundColor: colors.primary }} />
      </View>
    </View>
  );
}

export function AnimatedCounter({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const reduced = useReducedMotionPreference();
  const { colors } = useTheme();
  const count = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduced) {
      count.setValue(value);
      setDisplay(value);
      return;
    }
    setDisplay(0);
    count.setValue(0);
    const listener = count.addListener(({ value: current }) => setDisplay(Math.round(current)));
    const animation = Animated.timing(count, {
      toValue: value,
      duration: 1300,
      useNativeDriver: false,
    });
    animation.start();
    return () => {
      count.removeListener(listener);
      animation.stop();
    };
  }, [count, reduced, value]);

  return (
    <View style={{ flex: 1, minWidth: 78, alignItems: 'center', padding: 10 }}>
      <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '700', fontFamily: getFontFamily('heading') }}>{display}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center', fontFamily: getFontFamily('body') }}>{label}</Text>
    </View>
  );
}

export function PulseOnce({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotionPreference();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduced) {
      scale.setValue(1);
      return;
    }
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.04, duration: 450, useNativeDriver: nativeDriver }),
      Animated.timing(scale, { toValue: 1, duration: 450, useNativeDriver: nativeDriver }),
    ]).start();
  }, [reduced, scale]);

  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}

export function ScalePressable({
  children,
  onPress,
  style,
  disabled,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityState,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityRole?: 'button';
  accessibilityLabel?: string;
  accessibilityState?: { selected?: boolean; expanded?: boolean };
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotionPreference();
  const animateScale = (value: number) => {
    if (reduced) return;
    Animated.spring(scale, { toValue: value, useNativeDriver: nativeDriver, speed: 35, bounciness: 4 }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateScale(0.97)}
        onPressOut={() => animateScale(1)}
        disabled={disabled}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ ...accessibilityState, disabled }}
        style={{ flexGrow: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

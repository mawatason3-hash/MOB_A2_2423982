import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TextInputProps, Image } from 'react-native';
import { spacing, font, getFontFamily, useTheme } from '../theme';
import { FadeInUp, ScalePressable } from './Motion';
import * as Haptics from 'expo-haptics';
import { useProfile } from '../storage';

export function Screen({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const { profile } = useProfile();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {profile.backgroundUri && (
        <>
          <Image source={{ uri: profile.backgroundUri }} resizeMode="cover" accessibilityLabel="App background photo" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.28 }} />
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.bg, opacity: 0.62 }} />
        </>
      )}
      <ScrollView
        style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function Card({ children, onPress, label, delay = 0, accessibilityState }: { children: React.ReactNode; onPress?: () => void; label?: string; delay?: number; accessibilityState?: { expanded?: boolean; selected?: boolean } }) {
  const { colors } = useTheme();
  const cardStyle = [s.card, { backgroundColor: colors.card, borderColor: colors.border }];
  const body = <View style={cardStyle}>{children}</View>;
  return <FadeInUp delay={delay}>{onPress ? <ScalePressable onPress={onPress} style={cardStyle} accessibilityRole="button" accessibilityLabel={label} accessibilityState={accessibilityState}>{children}</ScalePressable> : body}</FadeInUp>;
}

export function H1({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[s.h1, { color: colors.text, fontFamily: getFontFamily('heading') }]} accessibilityRole="header">{children}</Text>;
}
export function H2({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[s.h2, { color: colors.text, fontFamily: getFontFamily('heading') }]} accessibilityRole="header">{children}</Text>;
}
export function Body({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  const { colors } = useTheme();
  return <Text style={[s.body, { color: muted ? colors.muted : colors.text, fontFamily: getFontFamily('body') }]}>{children}</Text>;
}

export function Chip({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[s.chip, { backgroundColor: colors.card2, borderColor: colors.border }]}>
      <Text style={[s.chipText, { color: colors.primary, fontFamily: getFontFamily('bodySemibold') }]}>{text}</Text>
    </View>
  );
}

export function Button({ title, onPress, variant = 'primary', disabled }: { title: string; onPress: () => void; variant?: 'primary' | 'ghost' | 'danger'; disabled?: boolean }) {
  const { colors } = useTheme();
  const bg = variant === 'primary' ? colors.primary : 'transparent';
  const fg = variant === 'primary' ? colors.primaryText : variant === 'danger' ? colors.danger : colors.text;
  const border = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.border;
  const press = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback unavailable; continuing without it.', error);
    }
    onPress();
  };

  return (
    <ScalePressable
      onPress={press}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[s.btn, { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : 1 }]}
    >
      <Text style={[s.btnText, { color: fg, fontFamily: getFontFamily('bodySemibold') }]}>{title}</Text>
    </ScalePressable>
  );
}

export function Field({ label, error, ...rest }: { label: string; error?: string } & TextInputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[s.label, { color: colors.muted, fontFamily: getFontFamily('bodySemibold') }]}>{label}</Text>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        placeholderTextColor={colors.muted}
        style={[s.input, { backgroundColor: colors.card, borderColor: error ? colors.danger : focused ? colors.primary : colors.border, color: colors.text, fontFamily: getFontFamily('body') }, rest.multiline && { minHeight: 110, textAlignVertical: 'top' }]}
      />
      {!!error && <Text style={[s.error, { color: colors.danger, fontFamily: getFontFamily('body') }]} accessibilityLiveRegion="polite">{error}</Text>}
    </View>
  );
}

export function EmptyState({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[s.empty, { borderColor: colors.border }]}>
      <Text style={{ color: colors.muted, textAlign: 'center', fontSize: font.body, fontFamily: getFontFamily('body') }}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: spacing.md, marginBottom: spacing.md },
  h1: { fontSize: font.h1, fontWeight: '800', marginBottom: spacing.sm },
  h2: { fontSize: font.h2, fontWeight: '700', marginBottom: spacing.sm },
  body: { fontSize: font.body, lineHeight: 23 },
  chip: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8, minHeight: 32, justifyContent: 'center' },
  chipText: { fontSize: font.small, fontWeight: '600' },
  btn: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', marginBottom: spacing.sm, minHeight: 48, justifyContent: 'center' },
  btnText: { fontSize: font.body, fontWeight: '700' },
  label: { fontSize: font.small, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: font.body, minHeight: 48 },
  error: { fontSize: font.small, marginTop: 4 },
  empty: { padding: spacing.lg, borderWidth: 1, borderRadius: 14 },
});

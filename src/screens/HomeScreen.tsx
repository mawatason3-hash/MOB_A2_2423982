import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, Image, Platform, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Screen, Card, Body, Chip, H2 } from '../components/ui';
import { AnimatedCounter, RotatingRoles, useReducedMotionPreference } from '../components/Motion';
import { ScalePressable } from '../components/Motion';
import { useProfile } from '../storage';
import { CONTACT_PHONE, FULL_NAME, INTRO_SENTENCE, VERIFICATION_CODE } from '../config';
import { LEADERSHIP, PROJECTS, SKILL_GROUPS } from '../data';
import { getFontFamily, useTheme } from '../theme';
import type { HomeScreenProps } from '../navigation';

const ROLES = ['Full-stack developer', 'Community founder', 'Software engineering student', 'Secretary General'];
const SKILL_COUNT = SKILL_GROUPS.reduce((total, group) => total + group.skills.length, 0);
const nativeDriver = Platform.OS !== 'web';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile } = useProfile();
  const { colors } = useTheme();
  const reduced = useReducedMotionPreference();
  const nameParts = FULL_NAME.split(' ');
  const initials = nameParts.map((word) => word[0]).join('').slice(0, 2).toUpperCase();
  const firstName = nameParts[0] ?? FULL_NAME;
  const lastName = nameParts.slice(1).join(' ');
  const firstOpacity = useRef(new Animated.Value(0)).current;
  const firstY = useRef(new Animated.Value(14)).current;
  const lastOpacity = useRef(new Animated.Value(0)).current;
  const lastY = useRef(new Animated.Value(14)).current;
  const ringRotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduced) {
      firstOpacity.setValue(1);
      lastOpacity.setValue(1);
      firstY.setValue(0);
      lastY.setValue(0);
      ringRotation.setValue(0);
      pulse.setValue(1);
      return;
    }
    const wordAnimations = Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(firstOpacity, { toValue: 1, duration: 480, useNativeDriver: nativeDriver }),
        Animated.timing(firstY, { toValue: 0, duration: 480, useNativeDriver: nativeDriver }),
      ]),
      Animated.parallel([
        Animated.timing(lastOpacity, { toValue: 1, duration: 480, useNativeDriver: nativeDriver }),
        Animated.timing(lastY, { toValue: 0, duration: 480, useNativeDriver: nativeDriver }),
      ]),
    ]);
    wordAnimations.start();
    const ringAnimation = Animated.loop(Animated.timing(ringRotation, {
      toValue: 1,
      duration: 18000,
      useNativeDriver: nativeDriver,
    }));
    ringAnimation.start();
    const pulseAnimation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.5, duration: 850, useNativeDriver: nativeDriver }),
      Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: nativeDriver }),
    ]));
    pulseAnimation.start();
    return () => {
      wordAnimations.stop();
      ringAnimation.stop();
      pulseAnimation.stop();
    };
  }, [firstOpacity, firstY, lastOpacity, lastY, pulse, reduced, ringRotation]);

  const checks = [
    { name: 'Add a headline', done: profile.headline.trim().length > 10 },
    { name: 'Add a biography', done: profile.bio.trim().length > 20 },
    { name: 'Add a photo', done: Boolean(profile.imageUri) },
    { name: 'Add email', done: profile.email.includes('@') },
    { name: 'Add contact link', done: profile.link.trim().length > 3 },
  ];
  const completed = checks.filter((item) => item.done).length;
  const strength = completed / checks.length;
  const strengthArc = 2 * Math.PI * 25;
  const liveProjects = PROJECTS.filter((project) => project.status === 'Live');
  const openProjects = () => navigation.navigate('Projects');
  const openProject = (projectId: string) => navigation.navigate('Projects', {
    screen: 'ProjectDetails',
    params: { projectId },
  });

  return (
    <Screen>
      <View style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 20, marginBottom: 14, backgroundColor: colors.card }}>
        <Svg width="100%" height="100%" viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.12 }}>
          {Array.from({ length: 15 }, (_, index) => (
            <React.Fragment key={index}>
              <Line x1={index * 26} y1="0" x2={index * 26} y2="300" stroke={colors.primary} strokeWidth="0.6" />
              <Line x1="0" y1={index * 26} x2="360" y2={index * 26} stroke={colors.primary} strokeWidth="0.6" />
            </React.Fragment>
          ))}
        </Svg>
        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 4 }}>
          My name is
        </Text>
        <Text accessibilityRole="header" accessibilityLabel={INTRO_SENTENCE} style={{ fontSize: 38, lineHeight: 43, fontFamily: getFontFamily('heading'), fontWeight: '800', marginBottom: 16 }}>
          <Animated.Text style={{ color: colors.text, opacity: firstOpacity, transform: [{ translateY: firstY }] }}>{firstName}</Animated.Text>
          {'\n'}
          <Animated.Text style={{ color: colors.primary, opacity: lastOpacity, transform: [{ translateY: lastY }] }}>{lastName}.</Animated.Text>
        </Text>

        <View style={{ width: 112, height: 112, alignSelf: 'center', marginBottom: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={{ position: 'absolute', width: 112, height: 112, transform: [{ rotate: ringRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
            <Svg width="112" height="112" viewBox="0 0 112 112">
              <Circle cx="56" cy="56" r="54" fill="none" stroke={colors.primary} strokeWidth="2" strokeDasharray="3 4" />
            </Svg>
          </Animated.View>
          {profile.imageUri ? (
            <Image source={{ uri: profile.imageUri }} accessibilityLabel="Profile photo" style={{ width: 92, height: 92, borderRadius: 46 }} />
          ) : (
            <View accessibilityLabel={`Avatar with initials ${initials}`} style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: colors.card2, alignItems: 'center', justifyContent: 'center', borderColor: colors.border, borderWidth: 1 }}>
              <Text style={{ color: colors.text, fontSize: 32, fontFamily: getFontFamily('heading'), fontWeight: '800' }}>{initials}</Text>
            </View>
          )}
        </View>
        <View style={{ overflow: 'hidden', height: 32, alignItems: 'center', justifyContent: 'center' }}>
          <RotatingRoles roles={ROLES} style={{ color: colors.primary, fontSize: 26, lineHeight: 30, fontFamily: getFontFamily('bodySemibold'), textAlign: 'center' }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 7, marginTop: 10, backgroundColor: colors.card2, borderRadius: 99 }}>
          <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.live, opacity: pulse, marginRight: 8 }} />
          <Text style={{ color: colors.text, fontFamily: getFontFamily('bodySemibold') }}>{profile.availability}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
        <Card><AnimatedCounter value={PROJECTS.length} label="Projects" /></Card>
        <Card><AnimatedCounter value={LEADERSHIP.length} label="Roles" /></Card>
        <Card><AnimatedCounter value={SKILL_COUNT} label="Skills" /></Card>
      </View>

      <Card delay={80}>
        <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '700', fontFamily: getFontFamily('bodySemibold'), marginBottom: 8 }}>{profile.headline}</Text>
        <Body>{profile.bio}</Body>
      </Card>

      <Card delay={120}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Svg width="64" height="64" viewBox="0 0 64 64" style={{ position: 'absolute' }}>
              <Circle cx="32" cy="32" r="25" fill="none" stroke={colors.border} strokeWidth="5" />
              <Circle cx="32" cy="32" r="25" fill="none" stroke={colors.primary} strokeWidth="5" strokeDasharray={`${strengthArc * strength} ${strengthArc}`} strokeLinecap="round" rotation="-90" origin="32, 32" />
            </Svg>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>{Math.round(strength * 100)}%</Text>
          </View>
          <View style={{ flex: 1, minWidth: 180 }}>
            <H2>Profile strength</H2>
            <Body muted>{completed === checks.length ? 'Everything is filled in. Nice work.' : `${completed} of ${checks.length} profile details added`}</Body>
          </View>
        </View>
        {checks.filter((item) => !item.done).map((item) => (
          <Text key={item.name} style={{ color: colors.muted, paddingVertical: 3 }}>+ {item.name}</Text>
        ))}
        {completed < checks.length && (
          <ButtonRow label="Complete profile" onPress={() => navigation.navigate('Profile')} color={colors.primary} textColor={colors.primaryText} />
        )}
      </Card>

      <Card delay={160}>
        <H2>Contact</H2>
        <ContactRow label="Email" value={profile.email || 'Not provided yet'} onAdd={!profile.email ? () => navigation.navigate('Profile') : undefined} />
        <ContactRow label="Phone" value={CONTACT_PHONE} />
        <ContactRow label="Link" value={profile.link || 'Not provided yet'} onAdd={!profile.link ? () => navigation.navigate('Profile') : undefined} />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <H2>Live projects</H2>
        <ButtonRow label="See all projects" onPress={openProjects} color={colors.primary} textColor={colors.primaryText} compact />
      </View>
      <FlatList
        horizontal
        data={liveProjects}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
        renderItem={({ item }) => (
          <ScalePressable
            onPress={() => openProject(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title} project details`}
            style={{ width: 236, minHeight: 140, padding: 16, marginRight: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}
          >
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', fontFamily: getFontFamily('heading'), marginBottom: 8 }}>{item.title}</Text>
            <Text numberOfLines={3} style={{ color: colors.muted, fontSize: 15, lineHeight: 21, marginBottom: 8 }}>{item.problem}</Text>
            <Chip text="Live" />
          </ScalePressable>
        )}
      />
      <Chip text={`Verification: ${VERIFICATION_CODE}`} />
    </Screen>
  );
}

function ContactRow({ label, value, onAdd }: { label: string; value: string; onAdd?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ color: colors.muted, fontWeight: '700', marginRight: 10 }}>{label}</Text>
      <Text style={{ color: colors.text, flexShrink: 1 }}>{value}</Text>
      {onAdd && (
        <ScalePressable onPress={onAdd} accessibilityRole="button" accessibilityLabel={`Add ${label.toLowerCase()}`} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 99, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, marginLeft: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Add</Text>
        </ScalePressable>
      )}
    </View>
  );
}

function ButtonRow({ label, onPress, color, textColor, compact = false }: { label: string; onPress: () => void; color: string; textColor: string; compact?: boolean }) {
  return (
    <ScalePressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ minHeight: 44, alignSelf: compact ? 'auto' : 'stretch', alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: color, paddingHorizontal: 14, marginTop: compact ? 0 : 10 }}
    >
      <Text style={{ color: textColor, fontWeight: '700' }}>{label}</Text>
    </ScalePressable>
  );
}

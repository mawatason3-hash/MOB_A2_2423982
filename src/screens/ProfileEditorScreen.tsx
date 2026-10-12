import React, { useEffect, useState } from 'react';
import { View, Text, Image, Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Screen, Card, H2, Field, Button, Body } from '../components/ui';
import { useProfile, Profile, PROFILE_IMAGE_PATH, PROFILE_BACKGROUND_PATH } from '../storage';
import { ScalePressable } from '../components/Motion';
import { useTheme, getFontFamily } from '../theme';
import { FULL_NAME } from '../config';

type Errors = Partial<Record<'headline' | 'bio' | 'email' | 'link', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValidationField = (field: keyof Profile): field is keyof Errors =>
  field === 'headline' || field === 'bio' || field === 'email' || field === 'link';

export function validate(p: Profile): Errors {
  const e: Errors = {};
  if (p.headline.trim().length < 10) e.headline = 'Headline must be at least 10 characters.';
  else if (p.headline.trim().length > 80) e.headline = 'Headline must be 80 characters or fewer.';
  if (p.bio.trim().length < 30) e.bio = 'Biography must be at least 30 characters.';
  else if (p.bio.trim().length > 300) e.bio = 'Biography must be 300 characters or fewer.';
  if (p.email.trim() && !EMAIL_RE.test(p.email.trim())) e.email = 'Enter a valid email address.';
  if (p.link.trim() && p.link.trim().length < 4) e.link = 'Link must be at least 4 characters.';
  return e;
}

export default function ProfileEditorScreen() {
  const { profile, save, reset, storageMessage } = useProfile();
  const { colors } = useTheme();
  const [draft, setDraft] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Errors>({});
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const initials = FULL_NAME.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => setDraft(profile), [profile]);
  useEffect(() => {
    if (!msg) return;
    const timer = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(timer);
  }, [msg]);

  const set = (k: keyof Profile) => (v: string) => {
    const updated = { ...draft, [k]: v };
    setDraft(updated);
    const updatedErrors = validate(updated);
    if (isValidationField(k)) {
      setErrors((current) => ({ ...current, [k]: updatedErrors[k] }));
    }
    setMsg(null);
  };

  const onSave = async () => {
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) {
      setMsg({ text: 'Fix the highlighted fields before saving.', ok: false });
      return;
    }
    try {
      await save({
        ...draft,
        headline: draft.headline.trim(),
        bio: draft.bio.trim(),
        primarySkill: draft.primarySkill.trim(),
        availability: draft.availability.trim(),
        email: draft.email.trim(),
        link: draft.link.trim(),
      });
      setMsg({ text: 'Saved on this device. Works offline.', ok: true });
    } catch (error) {
      console.error('Could not save the profile.', error);
      setMsg({ text: 'Could not save. Try again.', ok: false });
    }
  };

  const keepPhotoInAppStorage = async (uri: string, type: 'profile' | 'background') => {
    const destination = type === 'profile' ? PROFILE_IMAGE_PATH : PROFILE_BACKGROUND_PATH;
    if (!destination) throw new Error('The app document directory is unavailable on this device.');
    const temporaryPath = `${destination}.tmp`;
    const existingTemporaryPhoto = await FileSystem.getInfoAsync(temporaryPath);
    if (existingTemporaryPhoto.exists) await FileSystem.deleteAsync(temporaryPath, { idempotent: true });
    await FileSystem.copyAsync({
      from: uri,
      to: temporaryPath,
    });
    const existingPhoto = await FileSystem.getInfoAsync(destination);
    if (existingPhoto.exists) await FileSystem.deleteAsync(destination, { idempotent: true });
    await FileSystem.moveAsync({ from: temporaryPath, to: destination });
    setDraft((current) => ({ ...current, [type === 'profile' ? 'imageUri' : 'backgroundUri']: destination }));
    setMsg({ text: `${type === 'profile' ? 'Profile' : 'Background'} photo copied to this device. Tap Save profile to keep it.`, ok: true });
  };

  const pickFromGallery = async (type: 'profile' | 'background') => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setMsg({ text: 'Gallery permission denied. Enable it in phone Settings to choose a photo.', ok: false });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.7,
      });
      if (result.canceled) {
        setMsg({ text: 'No photo selected. Your current photo is unchanged.', ok: false });
        return;
      }
      await keepPhotoInAppStorage(result.assets[0].uri, type);
    } catch (error) {
      console.error('Could not choose and save a gallery photo.', error);
      setMsg({ text: 'Could not access or save a gallery photo. Try again.', ok: false });
    }
  };

  const takePhoto = async (type: 'profile' | 'background') => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setMsg({ text: 'Camera permission denied. Use the gallery instead or enable the camera in Settings.', ok: false });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === 'profile' ? [1, 1] : [16, 9],
        quality: 0.7,
      });
      if (result.canceled) {
        setMsg({ text: 'No photo selected. Your current photo is unchanged.', ok: false });
        return;
      }
      await keepPhotoInAppStorage(result.assets[0].uri, type);
    } catch (error) {
      console.error('Could not take and save a camera photo.', error);
      setMsg({ text: 'Could not access the camera or save the photo. Try again.', ok: false });
    }
  };

  const removePhoto = (type: 'profile' | 'background') => {
    const field = type === 'profile' ? 'imageUri' : 'backgroundUri';
    setDraft((d) => ({ ...d, [field]: null }));
    setMsg({ text: `${type === 'profile' ? 'Profile' : 'Background'} photo removed. Tap Save profile to keep this change.`, ok: true });
  };

  const onReset = () =>
    Alert.alert('Reset profile', 'Delete saved data and restore defaults?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          try {
            await reset();
            setErrors({});
            setMsg({ text: 'Profile reset to defaults.', ok: true });
          } catch (error) {
            console.error('Could not reset the profile.', error);
            setMsg({ text: 'Could not reset the saved profile. Try again.', ok: false });
          }
        },
      },
    ]);

  const skillOptions = ['Next.js', 'FastAPI', 'Python', 'PostgreSQL', 'React Native'];
  const availabilityOptions = ['Open to internships', 'Open to freelance work', 'Not available'];

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {storageMessage && <Text style={{ color: colors.danger, marginBottom: 12, fontFamily: getFontFamily('body') }} accessibilityLiveRegion="polite">{storageMessage}</Text>}
        <H2>Profile photo</H2>
        <Card delay={80}>
          {draft.imageUri ? (
            <Image source={{ uri: draft.imageUri }} accessibilityLabel="Profile photo preview" style={{ width: 92, height: 92, borderRadius: 46, alignSelf: 'center', marginBottom: 12 }} />
          ) : (
            <View accessibilityLabel={`Avatar with initials ${initials}`} style={{ width: 92, height: 92, borderRadius: 46, alignSelf: 'center', marginBottom: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card2, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', fontFamily: getFontFamily('heading') }}>{initials}</Text>
            </View>
          )}
          <Text style={{ color: colors.muted, marginBottom: 10, textAlign: 'center' }}>{draft.imageUri ? 'Photo selected.' : 'No photo selected. An avatar with your initials is shown.'}</Text>
          <Button title="Choose from gallery" variant="ghost" onPress={() => pickFromGallery('profile')} />
          <Button title="Take a photo" variant="ghost" onPress={() => takePhoto('profile')} />
          {draft.imageUri && <Button title="Remove photo" variant="danger" onPress={() => removePhoto('profile')} />}
        </Card>

        <H2>App background photo</H2>
        <Card delay={120}>
          {draft.backgroundUri ? (
            <Image source={{ uri: draft.backgroundUri }} accessibilityLabel="App background photo preview" resizeMode="cover" style={{ width: '100%', aspectRatio: 16 / 9, borderRadius: 12, marginBottom: 12 }} />
          ) : (
            <Text style={{ color: colors.muted, marginBottom: 10, textAlign: 'center' }}>No background photo selected. Your current theme background is shown.</Text>
          )}
          <Text style={{ color: colors.muted, marginBottom: 10, textAlign: 'center' }}>{draft.backgroundUri ? 'Background photo selected.' : ''}</Text>
          <Button title="Choose background from gallery" variant="ghost" onPress={() => pickFromGallery('background')} />
          <Button title="Take background photo" variant="ghost" onPress={() => takePhoto('background')} />
          {draft.backgroundUri && <Button title="Remove background photo" variant="danger" onPress={() => removePhoto('background')} />}
        </Card>

        <Card>
          <H2>Live preview</H2>
          <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '700', marginBottom: 8 }}>{draft.headline}</Text>
          <Body>{draft.bio}</Body>
          <View style={{ alignSelf: 'flex-start', marginTop: 10, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 99, backgroundColor: colors.card2 }}>
            <Text style={{ color: colors.text }}>{draft.availability}</Text>
          </View>
        </Card>

        <Card>
          <H2>Edit profile</H2>
          <Field label="Headline" value={draft.headline} onChangeText={set('headline')} error={errors.headline} />
          <Field label="Short biography" value={draft.bio} onChangeText={set('bio')} error={errors.bio} multiline numberOfLines={4} />
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>PRIMARY SKILL</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
            {skillOptions.map((skill) => {
              const selected = draft.primarySkill === skill;
              return (
                <ScalePressable
                  key={skill}
                  onPress={() => set('primarySkill')(skill)}
                  accessibilityLabel={`Set primary skill to ${skill}`}
                  accessibilityState={{ selected }}
                  style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1, borderRadius: 99, borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.card2, marginRight: 8, marginBottom: 8 }}
                >
                  <Text style={{ color: selected ? colors.primaryText : colors.text, fontFamily: getFontFamily('bodySemibold') }}>{skill}</Text>
                </ScalePressable>
              );
            })}
          </View>
          <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 }}>AVAILABILITY</Text>
          {availabilityOptions.map((option) => {
            const selected = draft.availability === option;
            return (
              <Pressable
                key={option}
                onPress={() => set('availability')(option)}
                accessibilityRole="radio"
                accessibilityLabel={option}
                accessibilityState={{ selected }}
                style={{ minHeight: 48, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingVertical: 8 }}
              >
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: selected ? colors.primary : colors.muted, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  {selected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary }} />}
                </View>
                <Text style={{ color: colors.text, flexShrink: 1 }}>{option}</Text>
              </Pressable>
            );
          })}
          <Field label="Email" value={draft.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" />
          <Field label="Contact link" value={draft.link} onChangeText={set('link')} error={errors.link} autoCapitalize="none" placeholder="GitHub, LinkedIn or website" />

          {msg && (
            <View style={{ backgroundColor: colors.text, borderRadius: 14, padding: 12, marginBottom: 12 }} accessibilityLiveRegion="polite">
              <Text style={{ color: colors.bg, fontFamily: getFontFamily('bodySemibold') }}>{msg.text}</Text>
            </View>
          )}
          <Button title="Save profile" onPress={onSave} />
          <Button title="Reset to defaults" variant="danger" onPress={onReset} />
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

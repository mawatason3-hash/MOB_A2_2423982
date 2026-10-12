import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { CONTACT_EMAIL } from './config';

export type Profile = {
  headline: string;
  bio: string;
  primarySkill: string;
  availability: string;
  email: string;
  link: string;
  imageUri: string | null;
  backgroundUri: string | null;
};

export const DEFAULT_PROFILE: Profile = {
  headline: 'Full-stack developer and software engineering student',
  bio: 'Final-year software engineering student at INES-Ruhengeri. I build and deploy web platforms with Next.js, FastAPI and PostgreSQL, and I founded the Association of Liberians in Musanze.',
  primarySkill: 'Next.js',
  availability: 'Open to internships',
  email: CONTACT_EMAIL,
  link: '',
  imageUri: null,
  backgroundUri: null,
};

const KEY = 'solomon_portfolio_profile_v1';
export const PROFILE_IMAGE_PATH = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}profile-photo.jpg`
  : '';
export const PROFILE_BACKGROUND_PATH = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}profile-background.jpg`
  : '';

type Ctx = {
  profile: Profile;
  loaded: boolean;
  storageMessage: string | null;
  save: (p: Profile) => Promise<void>;
  reset: () => Promise<void>;
};

const ProfileContext = createContext<Ctx | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used inside ProfileProvider.');
  return context;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved: unknown = JSON.parse(raw);
          if (!isRecord(saved)) throw new Error('Saved profile data is not an object.');
          const imageUri = typeof saved.imageUri === 'string' ? saved.imageUri : null;
          const backgroundUri = typeof saved.backgroundUri === 'string' ? saved.backgroundUri : null;
          const [hasValidImage, hasValidBackground] = await Promise.all([
            imageUri ? FileSystem.getInfoAsync(imageUri).then((info) => info.exists) : Promise.resolve(false),
            backgroundUri ? FileSystem.getInfoAsync(backgroundUri).then((info) => info.exists) : Promise.resolve(false),
          ]);
          setProfile({
            headline: typeof saved.headline === 'string' ? saved.headline : DEFAULT_PROFILE.headline,
            bio: typeof saved.bio === 'string' ? saved.bio : DEFAULT_PROFILE.bio,
            primarySkill: typeof saved.primarySkill === 'string' ? saved.primarySkill : DEFAULT_PROFILE.primarySkill,
            availability: typeof saved.availability === 'string' ? saved.availability : DEFAULT_PROFILE.availability,
            email: typeof saved.email === 'string' ? saved.email : DEFAULT_PROFILE.email,
            link: typeof saved.link === 'string' ? saved.link : DEFAULT_PROFILE.link,
            imageUri: hasValidImage ? imageUri : null,
            backgroundUri: hasValidBackground ? backgroundUri : null,
          });
        }
      } catch (error) {
        console.error('Could not load the saved profile.', error);
        setStorageMessage('Could not load saved profile data. Default profile values are shown.');
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const save = useCallback(async (p: Profile) => {
    if (p.imageUri && p.imageUri !== PROFILE_IMAGE_PATH) {
      throw new Error('Only the app-owned profile photo path can be saved.');
    }
    if (p.backgroundUri && p.backgroundUri !== PROFILE_BACKGROUND_PATH) {
      throw new Error('Only the app-owned profile background path can be saved.');
    }
    const previousImageUri = profile.imageUri;
    const previousBackgroundUri = profile.backgroundUri;
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(p));
    } catch (error) {
      setStorageMessage('Could not save the profile on this device.');
      throw error;
    }
    setProfile(p);
    setStorageMessage(null);
    const previousPhotos = [
      { uri: previousImageUri, nextUri: p.imageUri, label: 'profile photo' },
      { uri: previousBackgroundUri, nextUri: p.backgroundUri, label: 'profile background' },
    ];
    for (const photo of previousPhotos) {
      if (
        photo.uri &&
        photo.uri !== photo.nextUri &&
        FileSystem.documentDirectory &&
        photo.uri.startsWith(FileSystem.documentDirectory)
      ) {
        try {
          const photoInfo = await FileSystem.getInfoAsync(photo.uri);
          if (photoInfo.exists) await FileSystem.deleteAsync(photo.uri, { idempotent: true });
        } catch (error) {
          console.error(`Profile saved, but the previous ${photo.label} could not be removed.`, error);
          setStorageMessage(`Profile saved, but the previous ${photo.label} could not be removed.`);
        }
      }
    }
  }, [profile.backgroundUri, profile.imageUri]);

  const reset = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(KEY);
    } catch (error) {
      setStorageMessage('Could not remove saved profile data.');
      throw error;
    }
    setProfile(DEFAULT_PROFILE);
    setStorageMessage(null);

    const savedPhotos = [profile.imageUri, profile.backgroundUri];
    for (const uri of savedPhotos) {
      if (uri && FileSystem.documentDirectory && uri.startsWith(FileSystem.documentDirectory)) {
        try {
          const photoInfo = await FileSystem.getInfoAsync(uri);
          if (photoInfo.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
        } catch (error) {
          console.error('Profile reset, but a saved photo could not be removed.', error);
          setStorageMessage('Profile reset, but a saved photo could not be removed.');
        }
      }
    }
  }, [profile.backgroundUri, profile.imageUri]);

  return (
    <ProfileContext.Provider value={{ profile, loaded, storageMessage, save, reset }}>
      {children}
    </ProfileContext.Provider>
  );
}

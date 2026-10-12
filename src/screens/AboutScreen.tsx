import React from 'react';
import { Text, View } from 'react-native';
import { Screen, Card, H2, Body } from '../components/ui';
import { APP_NAME, APP_VERSION, FULL_NAME, REG_NUMBER, VERIFICATION_CODE } from '../config';
import { getFontFamily, useTheme } from '../theme';

function Row({ k, v }: { k: string; v: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>{k}</Text>
      <Text style={{ color: colors.text, fontSize: 16, fontFamily: getFontFamily('body') }}>{v}</Text>
    </View>
  );
}

export default function AboutScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <H2>About this app</H2>
      <Card delay={80}>
        <Row k="App name" v={APP_NAME} />
        <Row k="Student" v={FULL_NAME} />
        <Row k="Registration number" v={REG_NUMBER} />
        <Row k="Verification code" v={VERIFICATION_CODE} />
        <Row k="Version" v={APP_VERSION} />
      </Card>
      <Card delay={160}>
        <H2>Data use</H2>
        <Body>This app stores profile text and your selected photo in this device's app storage using AsyncStorage and the app document directory. No passwords, tokens or sensitive records are stored. The portfolio works fully offline; only links labelled "online" need a connection.</Body>
      </Card>
      <Card delay={240}>
        <H2>Engineering principles</H2>
        {[
          ['01 Offline-first', 'Every screen reads from local storage, no network needed.'],
          ['02 Typed data', 'Projects, roles and skills are strict TypeScript models.'],
          ['03 Accessible', 'Labelled controls, 44 px targets, readable contrast.'],
          ['04 Themeable', 'Dark and light themes with a choice of accent colour.'],
        ].map(([title, description]) => (
          <View key={title} style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.primary, fontWeight: '700', marginBottom: 2 }}>{title}</Text>
            <Body>{description}</Body>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

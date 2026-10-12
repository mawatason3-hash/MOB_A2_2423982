import React, { useState } from 'react';
import { LayoutAnimation, Platform, Text, UIManager, View } from 'react-native';
import { Body, Card, Chip, H2, Screen } from '../components/ui';
import { ScalePressable } from '../components/Motion';
import { LEADERSHIP } from '../data';
import { getFontFamily, useTheme } from '../theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FILTERS = ['All', 'Current', 'Past'] as const;

export default function LeadershipScreen() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [expanded, setExpanded] = useState<string | null>('l1');
  const entries = LEADERSHIP.filter((entry) => filter === 'All' || entry.current === (filter === 'Current'));

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((current) => current === id ? null : id);
  };

  return (
    <Screen>
      <H2>Leadership</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {FILTERS.map((item) => {
          const active = item === filter;
          return (
            <ScalePressable
              key={item}
              onPress={() => setFilter(item)}
              accessibilityLabel={`Show ${item.toLowerCase()} leadership roles`}
              accessibilityState={{ selected: active }}
              style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 99, borderWidth: 1, borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.card, marginRight: 8, marginBottom: 8 }}
            >
              <Text style={{ color: active ? colors.primaryText : colors.text, fontFamily: getFontFamily('bodySemibold') }}>{item}</Text>
            </ScalePressable>
          );
        })}
      </View>
      {entries.map((entry, index) => {
        const isOpen = expanded === entry.id;
        return (
          <View key={entry.id} style={{ flexDirection: 'row', alignItems: 'stretch' }}>
            <View style={{ width: 22, alignItems: 'center', marginRight: 8 }}>
              <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: entry.current ? 0 : 2, borderColor: colors.primary, backgroundColor: entry.current ? colors.primary : colors.bg, marginTop: 18 }} />
              {index < entries.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: colors.border }} />}
            </View>
            <View style={{ flex: 1 }}>
              <Card
                onPress={() => toggle(entry.id)}
                label={`${isOpen ? 'Collapse' : 'Expand'} ${entry.role} at ${entry.organisation}`}
                accessibilityState={{ expanded: isOpen }}
              >
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', fontFamily: getFontFamily('bodySemibold') }}>{entry.period}</Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{entry.current ? 'Current' : 'Past'}</Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', fontFamily: getFontFamily('heading'), marginTop: 4 }}>{entry.role}</Text>
                <Body muted>{entry.organisation}</Body>
                {isOpen && <Body>{entry.description}</Body>}
              </Card>
            </View>
          </View>
        );
      })}
      <H2>Leadership skills</H2>
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {['Public speaking', 'Team coordination', 'Record keeping and minutes', 'Event organising', 'Accountability and reporting', 'Meeting chairing'].map((skill) => <Chip key={skill} text={skill} />)}
        </View>
      </Card>
    </Screen>
  );
}

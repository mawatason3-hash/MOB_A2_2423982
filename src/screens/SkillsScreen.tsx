import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';
import { AnimatedSkillBar, ScalePressable } from '../components/Motion';
import { Body, Card, Chip, H2, Screen } from '../components/ui';
import { EDUCATION, LEADERSHIP_SKILLS, SKILL_GROUPS } from '../data';
import { useProfile } from '../storage';
import { getFontFamily, useTheme } from '../theme';

const SECTIONS = ['Technical', 'Leadership'] as const;
const AXIS_LABELS = ['Records', 'Team', 'Reporting', 'Events', 'Conflict'];
const CX = 130;
const CY = 112;
const R = 75;

function radarPoint(index: number, factor: number) {
  const angle = (Math.PI * 2 * index) / AXIS_LABELS.length - Math.PI / 2;
  return `${CX + Math.cos(angle) * R * factor},${CY + Math.sin(angle) * R * factor}`;
}

export default function SkillsScreen() {
  const [selected, setSelected] = useState<(typeof SECTIONS)[number]>('Technical');
  const { profile } = useProfile();
  const { colors } = useTheme();

  return (
    <Screen>
      <H2>Skills</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.card2, padding: 4, borderRadius: 14, alignSelf: 'flex-start', marginBottom: 16 }}>
        {SECTIONS.map((item) => {
          const active = selected === item;
          return (
            <ScalePressable
              key={item}
              onPress={() => setSelected(item)}
              accessibilityLabel={`${item} skills`}
              accessibilityState={{ selected: active }}
              style={{ minHeight: 44, minWidth: 110, alignItems: 'center', justifyContent: 'center', borderRadius: 11, paddingHorizontal: 14, backgroundColor: active ? colors.card : 'transparent' }}
            >
              <Text style={{ color: active ? colors.primary : colors.muted, fontWeight: '700' }}>{item}</Text>
            </ScalePressable>
          );
        })}
      </View>

      {selected === 'Technical' ? (
        <>
          <Body muted>Highlighted tag is your primary skill. Change it in Edit profile.</Body>
          {SKILL_GROUPS.map((group) => (
            <Card key={group.name}>
              <H2>{group.name}</H2>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {group.skills.map((skill) => {
                  const highlighted = skill.name.toLowerCase().includes(profile.primarySkill.toLowerCase())
                    || profile.primarySkill.toLowerCase().includes(skill.name.toLowerCase());
                  return (
                    <View key={skill.name} style={{ borderWidth: 1, borderRadius: 99, minHeight: 36, justifyContent: 'center', paddingHorizontal: 12, marginRight: 8, marginBottom: 8, borderColor: highlighted ? colors.primary : colors.border, backgroundColor: highlighted ? colors.primary : colors.card2 }}>
                      <Text style={{ color: highlighted ? colors.primaryText : colors.muted, fontFamily: getFontFamily('bodySemibold') }}>{skill.name}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          ))}
        </>
      ) : (
        <>
          <Card>
            <H2>Leadership overview</H2>
            <View style={{ alignItems: 'center', paddingVertical: 6 }}>
              <Svg width="260" height="228" viewBox="0 0 260 228" accessibilityLabel="Leadership radar chart">
                {[0.25, 0.5, 0.75, 1].map((scale) => (
                  <Polygon key={scale} points={AXIS_LABELS.map((_, index) => radarPoint(index, scale)).join(' ')} fill="none" stroke={colors.border} strokeWidth="1" />
                ))}
                {AXIS_LABELS.map((label, index) => (
                  <Line key={label} x1={CX} y1={CY} x2={radarPoint(index, 1).split(',')[0]} y2={radarPoint(index, 1).split(',')[1]} stroke={colors.border} strokeWidth="1" />
                ))}
                <Polygon points={AXIS_LABELS.map((_, index) => radarPoint(index, 0.28)).join(' ')} fill={`${colors.primary}38`} stroke={colors.primary} strokeWidth="2" />
                {AXIS_LABELS.map((label, index) => {
                  const point = radarPoint(index, 1.2).split(',');
                  return <SvgText key={label} x={point[0]} y={point[1]} fill={colors.muted} fontSize="10" textAnchor="middle">{label}</SvgText>;
                })}
              </Svg>
            </View>
          </Card>
          {LEADERSHIP_SKILLS.map((skill, index) => (
            <Card key={skill.name} delay={index * 80}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: colors.text, flexShrink: 1, marginRight: 8, fontFamily: getFontFamily('bodySemibold') }}>{skill.name}</Text>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>{skill.percent}% <Text style={{ color: colors.muted, fontWeight: '400' }}>{skill.level}</Text></Text>
              </View>
              <AnimatedSkillBar level={skill.percent} delay={index * 80} label={`${skill.level} · ${skill.percent}%`} />
            </Card>
          ))}
          <Card>
            <H2>Also</H2>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Chip text="Public speaking" />
              <Chip text="Meeting chairing" />
            </View>
          </Card>
          <Body muted>Self-assessed levels</Body>
        </>
      )}

      <H2>Education and timeline</H2>
      {EDUCATION.map((item, index) => (
        <View key={item.title} style={{ flexDirection: 'row', alignItems: 'stretch' }}>
          <View style={{ width: 18, alignItems: 'center', marginRight: 8 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: item.period === 'Ongoing' ? 0 : 2, borderColor: colors.primary, backgroundColor: item.period === 'Ongoing' ? colors.primary : colors.bg, marginTop: 18 }} />
            {index < EDUCATION.length - 1 && <View style={{ width: 2, flex: 1, backgroundColor: colors.border }} />}
          </View>
          <View style={{ flex: 1 }}>
            <Card delay={index * 80}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', fontFamily: getFontFamily('bodySemibold') }}>{item.period}</Text>
              <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', fontFamily: getFontFamily('bodySemibold') }}>{item.title}</Text>
              <Body muted>{item.place}</Body>
            </Card>
          </View>
        </View>
      ))}
    </Screen>
  );
}

import React, { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScalePressable } from '../components/Motion';
import { Screen, Card, Body, Chip, EmptyState, H2 } from '../components/ui';
import { PROJECTS } from '../data';
import { getFontFamily, useTheme } from '../theme';
import type { ProjectsStackParams } from '../navigation';

type Props = NativeStackScreenProps<ProjectsStackParams, 'ProjectsList'>;
const FILTERS = ['All', 'Live', 'In progress', 'Academic'] as const;

export default function ProjectsScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');
  const { colors } = useTheme();
  const projects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return PROJECTS.filter((project) => {
      const inCategory = filter === 'All' || project.status === filter;
      const searchable = [project.title, project.problem, project.contribution, ...project.tech]
        .join(' ')
        .toLocaleLowerCase();
      return inCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [filter, query]);

  return (
    <Screen>
      <H2>Projects</H2>
      <Text accessibilityRole="text" style={{ color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 6 }}>SEARCH PROJECTS</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Search projects"
        placeholder="Name, stack or keyword"
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={{ minHeight: 48, borderWidth: 1, borderRadius: 12, borderColor: colors.border, backgroundColor: colors.card, color: colors.text, paddingHorizontal: 14, marginBottom: 12, fontFamily: getFontFamily('body') }}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {FILTERS.map((option) => {
          const active = option === filter;
          return (
            <ScalePressable
              key={option}
              onPress={() => setFilter(option)}
              accessibilityLabel={`Filter ${option} projects`}
              accessibilityState={{ selected: active }}
              style={{
                minHeight: 44,
                borderRadius: 99,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : colors.card,
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginRight: 8,
                marginBottom: 8,
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: active ? colors.primaryText : colors.text, fontFamily: getFontFamily('bodySemibold') }}>
                {option}
              </Text>
            </ScalePressable>
          );
        })}
      </View>
      <Text style={{ color: colors.muted, marginBottom: 12 }}>{projects.length} of {PROJECTS.length} projects</Text>
      {projects.length === 0 && <EmptyState text="No projects match. Try a different word or filter." />}
      {projects.map((project, index) => (
        <Card
          key={project.id}
          delay={index * 60}
          label={`Open ${project.title} details`}
          onPress={() => navigation.navigate('ProjectDetails', { projectId: project.id })}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', flexShrink: 1, fontFamily: getFontFamily('heading'), marginRight: 8 }}>
              {project.title}
            </Text>
            <View style={{ borderWidth: 1, borderColor: project.status === 'Live' ? colors.live : project.status === 'Academic' ? colors.academic : colors.progress, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, minHeight: 30, justifyContent: 'center' }}>
              <Text style={{ color: project.status === 'Live' ? colors.live : project.status === 'Academic' ? colors.academic : colors.progress, fontSize: 12, fontWeight: '700' }}>{project.status}</Text>
            </View>
          </View>
          <Body muted>{project.problem}</Body>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
            {project.tech.map((tech) => <Chip key={tech} text={tech} />)}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

import React, { useState } from 'react';
import { View, Text, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen, Card, H1, H2, Body, Chip, Button, EmptyState } from '../components/ui';
import { PROJECTS } from '../data';
import { useTheme, getFontFamily } from '../theme';
import type { ProjectsStackParams } from '../navigation';

type Props = NativeStackScreenProps<ProjectsStackParams, 'ProjectDetails'>;

export default function ProjectDetailsScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const [linkError, setLinkError] = useState<string | null>(null);
  const project = PROJECTS.find((p) => p.id === route.params.projectId);
  if (!project) return <Screen><EmptyState text="Project not found." /></Screen>;

  return (
    <Screen>
      <H1>{project.title}</H1>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Chip text={project.status} />
      </View>
      <Card delay={80}><H2>Problem</H2><Body>{project.problem}</Body></Card>
      <Card delay={160}><H2>My contribution</H2><Body>{project.contribution}</Body></Card>
      <Card delay={320}>
        <H2>Technology</H2>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {project.tech.map((t) => <Chip key={t} text={t} />)}
        </View>
      </Card>
      {project.online?.map((link) => (
        <Button
          key={link.url}
          title={`Open ${link.label} (online)`}
          variant="ghost"
          onPress={async () => {
            try {
              setLinkError(null);
              await Linking.openURL(link.url);
            } catch {
              setLinkError(`Could not open ${link.label}. Check your connection and try again.`);
            }
          }}
        />
      ))}
      {linkError && <Text style={{ color: colors.danger, marginBottom: 12, fontFamily: getFontFamily('body') }} accessibilityLiveRegion="polite">{linkError}</Text>}
      <Button title="Back to projects" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

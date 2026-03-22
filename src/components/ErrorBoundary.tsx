import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../lib/constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message ?? 'Unknown error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const fullMessage = (error?.message ?? 'Unknown error') + '\n\nComponent Stack:\n' + (errorInfo?.componentStack ?? 'none');
    this.setState({ errorMessage: fullMessage });
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, errorInfo.componentStack);
    }
  }

  retry = (): void => {
    this.setState({ hasError: false, errorMessage: '" });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something didn't load right.</Text>
          <Text style={[styles.subtitle, { marginBottom: 8 }]}>Give it another try.</Text>
          <ScrollView style={styles.errorScroll} contentContainerStyle={styles.errorScrollContent}>
            <Text selectable style={styles.errorMessageStack}>{this.state.errorMessage}</Text>
          </ScrollView>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={this.retry}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: BORDER_RADIUS.button,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  errorMessage: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  errorScroll: { maxHeight: 200, width: '100%' },
  errorScrollContent: { paddingHorizontal: 16 },
  errorMessageStack: {
    color: '#ff6b6b',
    fontSize: 10,
    textAlign: 'left',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
    fontFamily: 'monospace',
  },
});

import React from 'react';
import { Text, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/ThemeContext';

interface GradientTextProps {
  text: string;
  theme?: 'main' | 'landing';
  style?: TextStyle;
  containerStyle?: ViewStyle;
}

// Since native text gradients are tricky (requiring MaskedView), 
// we'll implement a fallback visual style for now or use a simple colored text 
// if strict gradient text is too complex without extra native deps like masked-view.
// However, the user asked for visual consistency.
// For now, let's use a solid color fallback that matches the primary gradient color,
// OR valid workaround if possible. 
// Actually, simple way: apply color to text. Gradient text usually requires @react-native-masked-view/masked-view.
// Let's stick to a solid primary color from the gradient start for now to avoid extra deps if possible,
// OR just use the primary theme color.
// Wait, the user asked for "Gradients" on "Headers".
// Detailed Plan: Use a LinearGradient View as a background for badges/cards, but for text, maybe just use the primary color 
// as strictly implementing gradient text requires native dependencies we might want to avoid adding mid-stream if not critical.
// BUT, `react-native-mask-view` is standard. 
// Let's try to stick to what we have. 
// If the user wants gradient text, I'll need `masked-view`.
// For this component, I will just export a simple helper that maybe wraps children in a Gradient View 
// (for buttons, cards). For text, I'll return a Text component with the primary color for now, 
// as `GradientText` is tricky without MaskedView.

// REVISION: I will create `GradientBackground` instead.

interface GradientBackgroundProps {
  children: React.ReactNode;
  theme?: 'main' | 'landing';
  style?: ViewStyle;
  borderRadius?: number;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  theme = 'main',
  style,
  borderRadius = 0,
}) => {
  // Check if we can get theme context here? 
  // Ideally, this component should be pure. 
  // But for quick fix, let's accept an isDark prop OR just rely on the parent checking it?
  // Let's modify the component to use the hook if it's inside the provider.
  // Actually, let's check the context inside here.
  const { isDark } = useTheme();

  const colors = theme === 'landing'
    ? ['#00dbde', '#fc00ff'] as const
    : isDark 
      ? ['#1e3a8a', '#4c1d95'] as const // Darker Blue to Dark Purple for Dark Mode
      : ['#5B8CFF', '#8B5CF6'] as const;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius }, style]}
    >
      {children}
    </LinearGradient>
  );
};

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';

interface GradientButtonProps {
  onPress: () => void;
  title: string;
  loading?: boolean;
  disabled?: boolean;
  theme?: 'main' | 'landing';
  icon?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  title,
  loading = false,
  disabled = false,
  theme = 'main',
  icon = false,
  style,
  textStyle,
  size = 'medium',
}) => {
  const colors = theme === 'landing'
    ? ['#00dbde', '#fc00ff'] as const
    : ['#5B8CFF', '#8B5CF6'] as const;

  const paddingVertical = size === 'small' ? 10 : size === 'large' ? 18 : 16;
  const paddingHorizontal = size === 'small' ? 16 : size === 'large' ? 32 : 24;
  const fontSize = size === 'small' ? 13 : size === 'large' ? 16 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[{ borderRadius: 16, overflow: 'hidden' }, style]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical,
          paddingHorizontal,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            {icon && <ChevronRight size={size === 'small' ? 10 : 18} color="white" style={{ position: 'absolute', right: 10, opacity: 0 }} />} 
            {/* Hack to keep text centered or just standard flow */}
            {/* Let's keep existing flow but add Plus icon support if needed? No, user just wanted simple gradient buttons. */}
            
            <Text style={[{ color: '#FFFFFF', fontWeight: '700', fontSize }, textStyle]}>
              {title}
            </Text>
            {icon && <ChevronRight size={fontSize + 3} color="white" style={{ marginLeft: 4 }} />}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

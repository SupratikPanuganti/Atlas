import React, { useState } from 'react';
import { TouchableOpacity, TouchableOpacityProps, Animated } from 'react-native';

interface PressableCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: any;
  // When true, the inner touchable will expand to fill its container
  fill?: boolean;
}

export const PressableCard: React.FC<PressableCardProps> = ({
  children,
  style,
  onPress,
  fill = false,
  ...props
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={fill ? { flex: 1 } : undefined}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        {...props}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

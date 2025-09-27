import React, { useState } from 'react';
import { TouchableOpacity, TouchableOpacityProps, Animated } from 'react-native';

interface PressableCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: any;
}

export const PressableCard: React.FC<PressableCardProps> = ({
  children,
  style,
  onPress,
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
        style={{ flex: 1 }}
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

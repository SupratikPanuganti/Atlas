import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';

interface AnimatedProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  style?: any;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  height = 6,
  color = '#7CFFB2',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  showPercentage = false,
  style,
}) => {
  const [widthAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, widthAnim]);

  return (
    <View style={style}>
      <View
        style={{
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: color,
              borderRadius: height / 2,
            },
            {
              width: widthAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={{ color, fontSize: 12, marginTop: 4, textAlign: 'right' }}>
          {Math.round(progress * 100)}%
        </Text>
      )}
    </View>
  );
};

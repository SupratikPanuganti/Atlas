import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';

interface SlideInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  style?: any;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  delay = 0,
  duration = 300,
  direction = 'up',
  style,
}) => {
  const [slideXAnim] = useState(new Animated.Value(0));
  const [slideYAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const offset = 100;
    let initialTranslateX = 0;
    let initialTranslateY = 0;
    
    // Set initial position
    switch (direction) {
      case 'up':
        initialTranslateY = offset;
        break;
      case 'down':
        initialTranslateY = -offset;
        break;
      case 'left':
        initialTranslateX = offset;
        break;
      case 'right':
        initialTranslateX = -offset;
        break;
    }

    slideXAnim.setValue(initialTranslateX);
    slideYAnim.setValue(initialTranslateY);

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(slideXAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(slideYAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, direction, slideXAnim, slideYAnim, fadeAnim]);

  return (
    <Animated.View 
      style={[
        style, 
        { 
          opacity: fadeAnim,
          transform: [
            { translateX: slideXAnim },
            { translateY: slideYAnim },
          ],
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

import React, { useEffect, useState } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const [opacityAnim] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };

    shimmer();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

// Simple skeleton for bet items
export const BetItemSkeleton: React.FC = () => (
  <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
      <View style={{ flex: 1 }}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 4 }} />
        <Skeleton width="40%" height={12} />
      </View>
      <Skeleton width={60} height={20} borderRadius={12} />
    </View>
    
    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
      <View style={{ flex: 1 }}>
        <Skeleton width="30%" height={10} style={{ marginBottom: 2 }} />
        <Skeleton width="50%" height={14} />
      </View>
      <View style={{ flex: 1 }}>
        <Skeleton width="40%" height={10} style={{ marginBottom: 2 }} />
        <Skeleton width="60%" height={14} />
      </View>
    </View>
    
    <Skeleton width="80%" height={12} />
  </View>
);

// Simple skeleton for stats cards
export const StatsCardSkeleton: React.FC = () => (
  <View style={{ 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: 12, 
    padding: 16,
    marginHorizontal: 8,
    minWidth: 120 
  }}>
    <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
    <Skeleton width="70%" height={24} style={{ marginBottom: 4 }} />
    <Skeleton width="50%" height={10} />
  </View>
);
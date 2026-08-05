import { View, ActivityIndicator } from 'react-native';
export const DashboardSkeleton = () => (
  <View className="flex-1 items-center justify-center bg-background">
    <ActivityIndicator size="large" color="#C6F432" />
  </View>
);

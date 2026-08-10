// ⚠️ RECONSTRUCTED FILE — mình không có file gốc `navigation/AuthStack.tsx`.
// Cấu trúc dưới đây dựa theo pattern của RootNavigator.tsx (headerShown: false)
// và cách LoginScreen/RegisterScreen đang gọi navigation.navigate('Login' | 'Register').
// Nếu file gốc của bạn có cấu hình khác (ví dụ headerShown: true), hãy so sánh
// và merge lại cho khớp trước khi dùng.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpVerifyScreen from '../screens/OtpVerifyScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator
      id="AuthStack"
      screenOptions={{ headerShown: false }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    </Stack.Navigator>
  );
}
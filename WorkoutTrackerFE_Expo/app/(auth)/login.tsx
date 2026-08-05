import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../src/api/auth';
import Svg, { Path } from 'react-native-svg';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError(t('login.login_failed'));
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      await authApi.login(identifier, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || t('login.login_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-8">
        
        {/* Logo Section */}
        <View className="items-center mb-10">
          <View className="flex-row items-center justify-center space-x-2 mb-2">
            <Svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--electric)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M6 18h12M6 6h12M12 6v12M2 12h4M18 12h4" />
            </Svg>
            <Text className="text-4xl font-black text-on-surface tracking-tighter">
              PULSE
            </Text>
          </View>
          <Text className="text-electric-orange text-sm font-semibold tracking-widest uppercase">
            {t('login.subtitle')}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-on-surface mb-8 text-center">
          {t('login.title')}
        </Text>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <Text className="text-red-400 text-center font-medium">{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-muted-gray text-sm font-medium mb-2">{t('login.email_label')}</Text>
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder={t('login.email_hint')}
              placeholderTextColor="var(--muted-gray)"
              autoCapitalize="none"
              keyboardType="email-address"
              className="w-full bg-card border border-border-gray rounded-xl px-4 py-4 text-on-surface text-base"
            />
          </View>

          <View className="mb-6">
            <Text className="text-muted-gray text-sm font-medium mb-2 mt-4">{t('login.password_label')}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('login.password_hint')}
              placeholderTextColor="var(--muted-gray)"
              secureTextEntry
              className="w-full bg-card border border-border-gray rounded-xl px-4 py-4 text-on-surface text-base"
            />
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={isLoading}
            className={`w-full rounded-xl py-4 items-center justify-center mt-4 ${isLoading ? 'bg-electric-dim' : 'bg-electric'}`}
            style={{
              shadowColor: 'var(--electric)',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="var(--background)" />
            ) : (
              <Text className="text-background font-bold text-lg">{t('login.submit')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-muted-gray">{t('login.no_account')} </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-electric font-semibold">{t('login.sign_up')}</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../src/api/auth';
import Svg, { Path } from 'react-native-svg';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !username || !password) {
      setError(t('register.register_failed'));
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      await authApi.register(name, email, username, password);
      // Auto-login after register
      await authApi.login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || t('register.register_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-8 py-10">
        
        {/* Logo Section */}
        <View className="items-center mb-10 mt-8">
          <View className="flex-row items-center justify-center space-x-2 mb-2">
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--electric)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M6 18h12M6 6h12M12 6v12M2 12h4M18 12h4" />
            </Svg>
            <Text className="text-3xl font-black text-on-surface tracking-tighter">
              PULSE
            </Text>
          </View>
          <Text className="text-electric-orange text-xs font-semibold tracking-widest uppercase">
            {t('register.subtitle')}
          </Text>
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold text-on-surface mb-8 text-center">
          {t('register.title')}
        </Text>

        {/* Error Message */}
        {error ? (
          <View className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6">
            <Text className="text-red-400 text-center font-medium">{error}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View className="space-y-4">
          <View className="mb-4">
            <Text className="text-muted-gray text-sm font-medium mb-2">{t('register.name_label')}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('register.name_hint')}
              placeholderTextColor="var(--muted-gray)"
              autoCapitalize="words"
              className="w-full bg-card border border-border-gray rounded-xl px-4 py-4 text-on-surface text-base"
            />
          </View>

          <View className="mb-4">
            <Text className="text-muted-gray text-sm font-medium mb-2">{t('register.email_label')}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('register.email_hint')}
              placeholderTextColor="var(--muted-gray)"
              autoCapitalize="none"
              keyboardType="email-address"
              className="w-full bg-card border border-border-gray rounded-xl px-4 py-4 text-on-surface text-base"
            />
          </View>

          <View className="mb-4">
            <Text className="text-muted-gray text-sm font-medium mb-2">{t('register.username_label')}</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder={t('register.username_hint')}
              placeholderTextColor="var(--muted-gray)"
              autoCapitalize="none"
              className="w-full bg-card border border-border-gray rounded-xl px-4 py-4 text-on-surface text-base"
            />
          </View>

          <View className="mb-6">
            <Text className="text-muted-gray text-sm font-medium mb-2">{t('register.password_label')}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('register.password_hint')}
              placeholderTextColor="var(--muted-gray)"
              secureTextEntry
              className="w-full bg-card border border-border-gray rounded-xl px-4 py-4 text-on-surface text-base"
            />
          </View>

          <TouchableOpacity 
            onPress={handleRegister}
            disabled={isLoading}
            className={`w-full rounded-xl py-4 items-center justify-center mt-2 ${isLoading ? 'bg-electric-dim' : 'bg-electric'}`}
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
              <Text className="text-background font-bold text-lg">{t('register.submit')}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8 pb-10">
          <Text className="text-muted-gray">{t('register.already_account')} </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-electric font-semibold">{t('register.log_in')}</Text>
            </TouchableOpacity>
          </Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

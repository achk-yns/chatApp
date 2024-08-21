import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import tailwind from 'tailwind-rn';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <View style={tailwind('flex-1 bg-gray-100')}>
      {/* Header */}
      <View style={tailwind('bg-white p-6 items-center')}>
        <Text style={tailwind('text-2xl font-bold mt-4')}>{t('login')}</Text>
        <TextInput
          style={tailwind('border-b border-gray-300 p-3 mb-4')}
          placeholder={t('email')}
        />
        <TextInput
          style={tailwind('border-b border-gray-300 p-3 mb-4')}
          placeholder={t('password')}
          secureTextEntry
        />
        <TouchableOpacity style={tailwind('bg-blue-500 p-4 rounded-lg mb-4')}>
          <Text style={tailwind('text-white text-center text-lg')}>{t('loginButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginPage;

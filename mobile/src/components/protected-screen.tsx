import { ReactNode, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  View,
} from 'react-native';

import { Redirect } from 'expo-router';

import { isAuthenticated } from '@/services/auth';


type Props = {
  children: ReactNode;
};


export default function ProtectedScreen({
  children,
}: Props) {

  const [loading, setLoading] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);


  useEffect(() => {

    async function provjeri() {

      const rezultat =
        await isAuthenticated();

      setAuthenticated(rezultat);
      setLoading(false);

    }

    provjeri();

  }, []);


  if (loading) {

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >

        <ActivityIndicator size="large" />

      </View>
    );

  }


  if (!authenticated) {

    return (
      <Redirect href="/login" />
    );

  }


  return <>{children}</>;

}
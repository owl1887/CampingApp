import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Redirect } from 'expo-router';

import { isAuthenticated } from '@/services/auth';


type Props = {
  children: React.ReactNode;
};


export default function AuthGuard({
  children,
}: Props) {

  const [provjera, setProvjera] =
    useState(true);

  const [prijavljen, setPrijavljen] =
    useState(false);


  useEffect(() => {

    async function provjeriSesiju() {

      const rezultat =
        await isAuthenticated();

      setPrijavljen(rezultat);
      setProvjera(false);

    }

    provjeriSesiju();

  }, []);


  if (provjera) {

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


  if (!prijavljen) {

    return (
      <Redirect href="/login" />
    );

  }


  return <>{children}</>;

}
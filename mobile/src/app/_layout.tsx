import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>

      {/* Javne stranice */}
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
        }}
      />

      {/* Glavna aplikacija */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      {/* Ostale stranice */}
      <Stack.Screen
        name="reservation"
        options={{
          title: 'Rezervacija',
        }}
      />

      <Stack.Screen
        name="camp/[id]"
        options={{
          title: 'Detalji kampa',
        }}
      />

    </Stack>
  );
}
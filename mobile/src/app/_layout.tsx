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
    headerStyle: {
      backgroundColor: '#121212',
    },
    headerTintColor: '#81C784',
    headerTitleStyle: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  }}
/>

      <Stack.Screen
  name="camp/[id]"
  options={{
    title: 'Detalji kampa',
    headerStyle: {
      backgroundColor: '#121212',
    },
    headerTintColor: '#81C784',
    headerTitleStyle: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  }}
/>
<Stack.Screen
  name="reservation-details"
  options={{
    title: 'Detalji rezervacije',
    headerStyle: {
      backgroundColor: '#121212',
    },
    headerTintColor: '#81C784',
    headerTitleStyle: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  }}
/>
<Stack.Screen
  name="admin/add-camp"
  options={{
    title: 'Dodaj kamp',
    headerStyle: {
      backgroundColor: '#121212',
    },
    headerTintColor: '#81C784',
    headerTitleStyle: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  }}
/>
<Stack.Screen
  name="admin/users"
  options={{
    title: 'Korisnici',
    headerStyle: {
      backgroundColor: '#121212',
    },
    headerTintColor: '#81C784',
    headerTitleStyle: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  }}
/>
<Stack.Screen
  name="admin/reservations"
  options={{
    title: 'Upravljanje rezervacijama',
    headerStyle: {
      backgroundColor: '#121212',
    },
    headerTintColor: '#81C784',
    headerTitleStyle: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  }}
/>
<Stack.Screen
  name="admin"
  options={{
    title: 'Admin',
    headerStyle: {
      backgroundColor: '#121212',
    },
    headerTintColor: '#81C784',
    headerTitleStyle: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  }}
/>


<Stack.Screen
  name="admin/edit-camp"
  options={{
    title: 'Uredite kamp mjesto',
    headerStyle: {
      backgroundColor: '#121212',
    },
    headerTintColor: '#81C784',
    headerTitleStyle: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  }}
/>

    </Stack>
  );
}
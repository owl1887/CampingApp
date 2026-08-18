import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Početna',
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Pretraga',
        }}
      />

      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Rezervacije',
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Lista želja',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
        }}
      />

    </Tabs>
  );
}
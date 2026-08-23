import { Tabs } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import AuthGuard from '@/components/auth-guard';


export default function TabLayout() {

  return (

    <AuthGuard>

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#208AEF',
          tabBarInactiveTintColor: '#777',
          tabBarLabelStyle: {
            fontSize: 11,
          },
        }}
      >

        <Tabs.Screen
          name="index"
          options={{
            title: 'Početna',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="home-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />


        <Tabs.Screen
          name="search"
          options={{
            title: 'Pretraga',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="search-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />


        <Tabs.Screen
          name="reservations"
          options={{
            title: 'Rezervacije',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="calendar-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />


        <Tabs.Screen
          name="wishlist"
          options={{
            title: 'Lista želja',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="heart-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />


        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',

            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

      </Tabs>

    </AuthGuard>

  );
}
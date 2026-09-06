import { Tabs } from 'expo-router';

import { Ionicons } from '@expo/vector-icons';

import AuthGuard from '@/components/auth-guard';


export default function TabLayout() {

  return (

    <AuthGuard>

      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarActiveTintColor: '#81C784',
          tabBarInactiveTintColor: '#757575',

          tabBarStyle: {
            backgroundColor: '#1E1E1E',
            borderTopColor: '#2C2C2C',
            borderTopWidth: 1,
            height: 65,
            paddingBottom: 7,
            paddingTop: 5,
          },

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >

        {/* POČETNA */}

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


        {/* PRETRAGA */}

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


        {/* REZERVACIJE */}

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


        {/* LISTA ŽELJA */}

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


        {/* PROFIL */}

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
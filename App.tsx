import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MessageSquare, LayoutDashboard, Trophy } from 'lucide-react-native';

import { AppProvider } from './src/contexts/AppContext';

import { LandingPage } from './src/pages/LandingPage';
import { ChatPage } from './src/pages/ChatPage';
import { DashboardPage } from './src/pages/DashboardPage';
import { LeaderboardPage } from './src/pages/LeaderboardPage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4f46e5',
                tabBarInactiveTintColor: '#6b7280',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                    backgroundColor: '#ffffff',
                },
            }}
        >
            <Tab.Screen 
                name="Learn" 
                component={ChatPage} 
                options={{
                    tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />
                }}
            />
            <Tab.Screen 
                name="Dashboard" 
                component={DashboardPage} 
                options={{
                    tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />
                }}
            />
            <Tab.Screen 
                name="Leaderboard" 
                component={LeaderboardPage} 
                options={{
                    tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />
                }}
            />
        </Tab.Navigator>
    );
}

function App() {
    return (
        <SafeAreaProvider>
            <AppProvider>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Landing" component={LandingPage} />
                        <Stack.Screen name="MainTab" component={MainTabNavigator} />
                    </Stack.Navigator>
                </NavigationContainer>
            </AppProvider>
        </SafeAreaProvider>
    );
}

export default App;

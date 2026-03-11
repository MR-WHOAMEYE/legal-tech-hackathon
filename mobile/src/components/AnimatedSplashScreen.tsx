import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Dimensions, Easing } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

interface AnimatedSplashScreenProps {
    onAnimationComplete: () => void;
    isAppReady: boolean;
}

export const AnimatedSplashScreen: React.FC<AnimatedSplashScreenProps> = ({ onAnimationComplete, isAppReady }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isNativeHidden, setIsNativeHidden] = useState(false);

    useEffect(() => {
        if (isAppReady) {
            // First, hide the native splash screen. Our JS view is rendering underneath it
            // looking exactly the same.
            SplashScreen.hideAsync().then(() => {
                setIsNativeHidden(true);
            });
        }
    }, [isAppReady]);

    useEffect(() => {
        if (isNativeHidden) {
            // Start the custom animation!
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 2000,
                    delay: 1000, // Hold for 1 second before fading
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 2000,
                    delay: 1000, // Sync with fade
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            ]).start(() => {
                onAnimationComplete();
            });
        }
    }, [isNativeHidden, fadeAnim, scaleAnim, onAnimationComplete]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    pointerEvents: 'none', // Allow touches to pass through while fading
                }
            ]}
        >
            <Animated.Image
                source={require('../../assets/splash-icon.png')}
                style={[
                    styles.image,
                    {
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
                resizeMode="contain"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Ensure it sits on top of everything
    },
    image: {
        width: 200,
        height: 200,
    },
});

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Onboarding = ({ onComplete }) => {
    const navigation = useNavigation();

    const [firstName, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [isValidName, setIsValidName] = useState(false);
    const [isValidEmail, setIsValidEmail] = useState(false);

    const validateName = (name) => {
        const isValid = /^[A-Za-z]+$/.test(name);
        setIsValidName(isValid);
        setFirstName(name);
    };

    const validateEmail = (email) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        setIsValidEmail(isValid);
        setEmail(email);
    };

    const isButtonDisabled = !(isValidName && isValidEmail);

    const handleNext = async () => {
        try {
            const userData = { firstName, email };
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('isOnboardingCompleted', 'true');

            onComplete(); // Update state in the parent component
            navigation.replace('Home'); // Navigate to 'Home'
        } catch (error) {
            console.error('Failed to save user data:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Little Lemon</Text>
                <Image
                    source={require('../assets/logo.png')} // Update the path to your logo file
                    style={styles.logo}
                />
            </View>

            {/* Input Fields */}
            <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                value={firstName}
                onChangeText={validateName}
            />
            {!isValidName && firstName.length > 0 && (
                <Text style={styles.errorText}>First name must contain only letters.</Text>
            )}

            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {!isValidEmail && email.length > 0 && (
                <Text style={styles.errorText}>Enter a valid email address.</Text>
            )}

            {/* Next Button */}
            <TouchableOpacity
                style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
                disabled={isButtonDisabled}
                onPress={handleNext}
            >
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#F4CE14', // Brand yellow for the background
    },
    header: {
        alignItems: 'center', // Center align both text and logo
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#495E57', // Brand green for the text
        marginBottom: 10, // Add spacing below the title
    },
    logo: {
        maxWidth: '80%', // Allow logo to occupy up to 80% of the screen width
        maxHeight: 150, // Constrain maximum height for consistency
        resizeMode: 'contain', // Ensure the aspect ratio is preserved
    },
    input: {
        borderWidth: 1,
        borderColor: '#495E57', // Brand green for the input border
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff', // White for contrast
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#495E57', // Brand green for the button
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc', // Neutral gray for disabled button
    },
    buttonText: {
        color: '#F4CE14', // Brand yellow for the button text
        fontSize: 16,
        fontWeight: 'bold',
    },
});


export default Onboarding;

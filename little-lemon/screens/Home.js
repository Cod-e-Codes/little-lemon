import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

// Open the SQLite database
const db = SQLite.openDatabaseAsync('little_lemon.db');

const Home = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [firstName, setFirstName] = useState('Cody'); // Example first name
    const [lastName, setLastName] = useState('Marsengill'); // Example last name
    const [avatarExists, setAvatarExists] = useState(true); // Tracks if avatar image loads successfully
    const navigation = useNavigation();

    // Fetch menu data from the remote server
    const fetchMenuData = async () => {
        try {
            const response = await fetch(
                'https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/menu.json?raw=true'
            );
            const json = await response.json();
            const menu = json.menu;

            // Store the data in SQLite
            await storeMenuInDatabase(menu);
            setMenuItems(menu); // Update state with fetched data
        } catch (error) {
            console.error('Error fetching menu data:', error);
        }
    };

    // Store menu data in SQLite using async transactions
    const storeMenuInDatabase = async (menu) => {
        await db.withTransactionAsync(async (tx) => {
            await tx.execAsync(
                'CREATE TABLE IF NOT EXISTS menu (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, description TEXT, image TEXT);'
            );

            for (const item of menu) {
                await tx.execAsync(
                    'INSERT INTO menu (name, price, description, image) VALUES (?, ?, ?, ?);',
                    [item.name, item.price, item.description, item.image]
                );
            }
        });
    };

    // Load menu data from SQLite using async transactions
    const loadMenuFromDatabase = async () => {
        await db.withTransactionAsync(async (tx) => {
            const result = await tx.execAsync('SELECT * FROM menu;');
            const rows = result.rows || [];

            if (rows.length > 0) {
                setMenuItems(rows);
            } else {
                fetchMenuData(); // Fetch from server if database is empty
            }
        });
    };

    // Load data when the component mounts
    useEffect(() => {
        loadMenuFromDatabase();
    }, []);

    // Render each menu item
    const renderMenuItem = ({ item }) => (
        <View style={styles.menuItem}>
            <Image
                source={{
                    uri: `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${item.image}?raw=true`,
                }}
                style={styles.menuImage}
            />
            <View style={styles.menuTextContainer}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.menuPrice}>${item.price.toFixed(2)}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
        </View>
    );

    const renderAvatar = () => {
        const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

        return (
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarContainer}>
                {avatarExists ? (
                    <Image
                        source={require('../assets/avatar.png')}
                        style={styles.avatar}
                        onError={() => setAvatarExists(false)}
                    />
                ) : (
                    <View style={styles.fallbackAvatar}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Little Lemon</Text>
                {renderAvatar()}
            </View>
            <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No menu items available</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4CE14' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#495E57' },
    headerText: { color: '#F4CE14', fontSize: 24, fontWeight: 'bold' },
    avatarContainer: { width: 40, height: 40 },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    fallbackAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#495E57', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#F4CE14', fontSize: 16, fontWeight: 'bold' },
    listContainer: { padding: 10 },
    menuItem: { flexDirection: 'row', marginBottom: 10, padding: 10, backgroundColor: '#fff', borderRadius: 8 },
    menuImage: { width: 80, height: 80, borderRadius: 8 },
    menuTextContainer: { marginLeft: 10, flex: 1 },
    menuName: { fontSize: 18, fontWeight: 'bold', color: '#495E57' },
    menuPrice: { fontSize: 16, color: '#495E57', marginVertical: 5 },
    menuDescription: { fontSize: 14, color: '#7D7D7D' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { fontSize: 16, color: '#495E57', textAlign: 'center' },
});

export default Home;

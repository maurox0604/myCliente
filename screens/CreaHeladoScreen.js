import React from 'react';
// import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useContext, useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView } from "react-native"; 
import InputHelado from '../components/InputHelado';
import * as ImagePicker from 'expo-image-picker';
// import { DbaseContext } from '../context/DbaseContext'



const CreaHeladoScreen = () => {
    return (
        <View>
        <Text>Este es settings</Text>
            <SafeAreaView style={styles.container}> 
                <InputHelado />
            </SafeAreaView>
        </View>
    )
}
export default CreaHeladoScreen;

const styles = StyleSheet.create({})

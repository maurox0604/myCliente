import React from 'react';
// import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { StyleSheet, Text, View, FlatList, SafeAreaView } from "react-native"; 
import InputHelado from '../components/InputHelado';

const CreaHeladoScreen = () => {
    return (
        <View>
        <Text>Este es settings</Text>
            <SafeAreaView style={styles.container}> 
                {/* <FlatList
                    data={todos}
                    keyExtractor={(todo) => todo.id}
                    renderItem={({ item }) => (
                        <Helado {...item}  clearTodo={clearTodo} />
                        )}
                        
                    ListHeaderComponent={() => <Text style={styles.title}>Queen - Hoy xxxxxx xxxxxxxxxxx</Text>}
                    contentContainerStyle={styles.contentContainerStyle}
                /> */}

                {/* <InputHelado todos={todos} setTodos={setTodos} /> */}
                <InputHelado />
            </SafeAreaView>
        </View>
    )
}
export default CreaHeladoScreen;

const styles = StyleSheet.create({})

import React, { forwardRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

const CartModal = ({ closeModal }) => {
    return (
        <View style={styles.contentContainer}>
            <Text style={styles.title}>Cart Modal</Text>
            {/* Aquí puedes agregar el contenido del carrito */}
            <Button title="Close" onPress={closeModal} />
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
});


export default CartModal;

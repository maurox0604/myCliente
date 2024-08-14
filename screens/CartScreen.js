import React, { useRef } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

const CartScreen = () => {
    const cartModalRef = useRef(null);

    const openCartModal = () => {
        cartModalRef.current?.present();
    };

    const closeCartModal = () => {
        cartModalRef.current?.dismiss();
    };

    return (
        <View style={styles.container}>
        <Text>CartScreen js</Text>
            <Button title="Open Cart" onPress={openCartModal} />
            <BottomSheetModal ref={cartModalRef} snapPoints={['50%']}>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Cart Screen</Text>
                    <Button title="Close" onPress={closeCartModal} />
                </View>
            </BottomSheetModal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'red'
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:'green'
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
});

export default CartScreen;

import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';

const ImageUpload = () => {
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        });

        if (!result.canceled) {
        setImage(result.assets[0].uri);
        console.log("result: ", result)
        console.log("uri: ", result.assets[0].uri)
        }
    };

    const uploadImage = async () => {
        let localUri = image;
        let filename = localUri.split('/').pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        let formData = new FormData();
        formData.append('image', { uri: localUri, name: filename, type });

        await fetch('http://192.168.1.11:3001/upload', {
        method: 'POST',
        body: formData,
        headers: {
            'content-type': 'multipart/form-data',
        },
        });
    };

    return (
        <View>
        <Button title="☺ Seleccionar Imagen ☺" onPress={pickImage} />
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
        <Button title="Subir Imagen" onPress={uploadImage} />
        </View>
    );
};

export default ImageUpload;

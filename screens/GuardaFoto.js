import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import axios from 'axios';

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
    let formData = new FormData();
    formData.append('image', {
        uri: image,  // Asegúrate de que sea la URI correcta de la imagen
        type: 'image/jpeg',  // Cambia a 'image/png' si es necesario
        name: 'upload.jpg',  // Nombre del archivo
    });

    try {
        await axios.post('http://localhost:3001/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        alert('Imagen subida con éxito');
    } catch (error) {
        console.error('Error al subir la imagen:', error);
    }
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

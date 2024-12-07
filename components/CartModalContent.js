const CartModalContent = ({ closeModal, carrito }) => {
    const [helados, setHelados] = useState([]); // Estado para los helados
    const { emailUser } = useContext(AuthContext);
    const { carts, totalPrice, clearCart, calculateTotalPrice } = useContext(CartContext);

    useEffect(() => {
        calculateTotalPrice(carts);
    }, [carts]);

    useEffect(() => {
        fetchHelados();
    }, []);

    const fetchHelados = async () => {
        try {
            const response = await fetch(`https://backend-de-prueba-delta.vercel.app/helados`);
            const data = await response.json();
            console.log("Helados obtenidos: ", data);
            setHelados(data); // Actualizar el estado
        } catch (error) {
            console.error("Error al obtener los helados:", error);
        }
    };

    const guardarVentas = async () => {
        try {
            const response = await fetch(`https://backend-de-prueba-delta.vercel.app/ventas`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    items: carts.map(item => ({ ...item, user: emailUser })),
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("Datos actualizados: ", data);

            await fetchHelados(); // Recargar los helados
            clearModal();
            closeModal();
        } catch (error) {
            console.error('Error al guardarVentas el helado:', error);
            alert(`No se pudo guardarVentas el helado: ${error.message}`);
        }
    };

    return (
        <SafeAreaView style={styles.contentContainer}>
            <View style={styles.contHeader}>
                {carts.length === 0 ? (
                    <Text>NO hay nada en el carrito</Text>
                ) : (
                    <Text style={styles.title}> Este es CartModalContent </Text>
                )}
                <Pressable onPress={closeModal} style={styles.botCerrarModal}>
                    <Text style={{ color: "white", fontWeight: "bold" }}>x</Text>
                </Pressable>
            </View>

            <View style={styles.contFlatList}>
                <FlatList
                    style={{ flex: 1 }}
                    data={helados} // Lista vinculada al estado
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <ItemCart {...item} />}
                    contentContainerStyle={styles.contentContainerStyle}
                />
            </View>

            <View style={styles.pie}>
                <View>
                    <Text>TOTAL: </Text>
                    <Text style={styles.priceText}> ${(totalPrice).toLocaleString('es-ES')}</Text>
                </View>

                <Pressable style={styles.button} onPress={guardarVentas} disabled={carts.length === 0}>
                    <Text style={styles.buttonText}> Compra </Text>
                </Pressable>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
};

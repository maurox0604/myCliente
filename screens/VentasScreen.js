import { useEffect } from "react";
// import { getTasksRequest } from "../api/ventas.api"; 
// import TaskCard from "../components/TaskCard";
import VentasItem from "../components/VentasItem";
import { useVentas } from "../context/VentasContext";


function VentasScreen() {
    const { ventas, loadVentas } = useVentas();

    useEffect(() => {
        loadVentas();
    }, []);

    function renderMain() {
        if (ventas.length === 0) return <p>Not ventas yet...</p>
        return ventas.map((venta) => <VentasItem venta={venta} key={venta.id} />)
    }


        return (
        <div>
        <h1 >LAS VENTAS</h1>
        <div >{ renderMain()}</div>
        </div>
    )
}
export default VentasScreen;
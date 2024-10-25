// import { useTasks } from "../context/TaskContext";
// import { useNavigate } from "react-router-dom";
// import{useNavigate} from "react-router-dom";
// import { useVentas } from "../context/VentasContext";

/* eslint-disable react/prop-types */


function VentasItem({venta}) {

    // const { deleteTask, toggleTaskDone } = useTasks();
    // const navigate = useNavigate();
    
    // const handleDone = async () => {
    //     await toggleTaskDone(venta.id);
    // };

    return (
        <div >
            <header >
                <h2 >{venta.sabor}</h2>
                {/* <span>{venta.done === 1 || venta.done === true ? "👌" : "❌"}</span> */}
            </header>

            <p >{venta.venta_helado}</p>
            <span >{venta.fecha}</span>
{/* 
            <div >
                <button  onClick={() => deleteTask(venta.id)}>Delete</button>
                <button  onClick={() => navigate(`/edit/${venta.id}`)}>Edit</button>
                <button  onClick={() => handleDone(venta.done)}>Toggle venta</button>
            </div> */}
        </div>
    )
}
export default VentasItem

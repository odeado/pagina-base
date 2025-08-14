import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Home() {
  const [data, setData] = useState("");

  const saveData = async () => {
    await addDoc(collection(db, "todos"), {
      text: data,
      createdAt: new Date(),
    });
    setData("");
  };

  return (
    <div>
      <h1>Guardar en Firebase</h1>
      <input 
        type="text" 
        value={data} 
        onChange={(e) => setData(e.target.value)} 
      />
      <button onClick={saveData}>Guardar</button>
    </div>
  );
}
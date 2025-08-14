import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function PublicPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setPosts(data);
    } catch (error) {
      console.error("Error al cargar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPosts(); 
  }, []);

  if (loading) return <div style={{ padding: "20px" }}>Cargando...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Mi Blog Público</h1>
      
      {posts.length === 0 ? (
        <p>No hay posts disponibles</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {posts.map(post => (
            <article key={post.id} style={{ border: "1px solid #eee", borderRadius: "8px", overflow: "hidden" }}>
              {post.imageBase64 && (
                <img 
                  src={post.imageBase64} 
                  alt={post.title} 
                  style={{ width: "100%", height: "200px", objectFit: "cover" }} 
                />
              )}
              <div style={{ padding: "15px" }}>
                <h2 style={{ marginTop: "0" }}>{post.title}</h2>
                <p>{post.content}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
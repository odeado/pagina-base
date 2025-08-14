import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Head from "next/head";


useEffect(() => {
  const testConnection = async () => {
    try {
      const testDoc = await getDocs(collection(db, "test_connection"));
      console.log("Conexión exitosa:", testDoc);
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };
  testConnection();
}, []);


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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Head>
        <title>Mi Blog Público</title>
      </Head>
      
      <h1>Últimos Posts</h1>
      
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {posts.map(post => (
            <article key={post.id} style={{ 
              border: '1px solid #eee',
              borderRadius: '8px',
              padding: '20px'
            }}>
              {post.imageBase64 && (
                <img 
                  src={post.imageBase64} 
                  alt={post.title}
                  style={{ 
                    width: '100%', 
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                  }}
                />
              )}
              <h2>{post.title}</h2>
              <p style={{ color: '#666' }}>{post.content}</p>
              <small>
                {post.createdAt?.toDate()?.toLocaleDateString()}
              </small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
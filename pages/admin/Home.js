import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";

export default function AdminPanel() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 500000) { // Límite de 500KB
      alert("La imagen debe ser menor a 500KB");
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const savePost = async () => {
    if (!title || !content) {
      alert("Título y contenido son requeridos");
      return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        imageBase64,
        createdAt: new Date()
      });
      
      setTitle("");
      setContent("");
      setImageBase64("");
      fetchPosts();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setPosts(data);
    } catch (error) {
      console.error("Error:", error);
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
        <title>Panel Administrativo</title>
      </Head>
      
      <button 
        onClick={() => router.push('/')}
        style={{ marginBottom: '20px' }}
      >
        Ver Página Pública
      </button>

      <h1>Panel Administrativo</h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>Nuevo Post</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Contenido:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              minHeight: '150px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Imagen:</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />
          {imageBase64 && (
            <div style={{ marginTop: '10px' }}>
              <img 
                src={imageBase64} 
                alt="Preview" 
                style={{ 
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '4px'
                }} 
              />
              <button 
                onClick={() => setImageBase64("")}
                style={{ 
                  display: 'block',
                  marginTop: '5px',
                  color: 'red',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Eliminar imagen
              </button>
            </div>
          )}
        </div>
        
        <button 
          onClick={savePost} 
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            background: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? "Guardando..." : "Publicar Post"}
        </button>
      </div>

      <div>
        <h2>Posts Existentes ({posts.length})</h2>
        
        {loading && posts.length === 0 ? (
          <p>Cargando posts...</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {posts.map(post => (
              <div 
                key={post.id}
                style={{ 
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '15px'
                }}
              >
                <h3>{post.title}</h3>
                {post.imageBase64 && (
                  <img 
                    src={post.imageBase64} 
                    alt={post.title}
                    style={{ 
                      maxWidth: '200px',
                      margin: '10px 0',
                      borderRadius: '4px'
                    }} 
                  />
                )}
                <p>{post.content}</p>
                <small style={{ color: '#666' }}>
                  {post.createdAt?.toDate()?.toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
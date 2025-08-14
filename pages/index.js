import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Head from "next/head";
import styles from "../styles/PublicPage.module.css";

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
    <div className={styles.container}>
      <Head>
        <title>Mi Blog Público | Comparte tus ideas</title>
        <meta name="description" content="Blog personal con artículos sobre tecnología y desarrollo web" />
      </Head>
      
      <header className={styles.header}>
        <h1 className={styles.title}>Explora Nuestros Artículos</h1>
        <p className={styles.subtitle}>Descubre las últimas publicaciones de nuestra comunidad</p>
      </header>
      
      {loading ? (
        <div className={styles.loading}>Cargando artículos...</div>
      ) : (
        <div className={styles.postsGrid}>
          {posts.map(post => (
            <article key={post.id} className={styles.postCard}>
              {post.imageBase64 && (
                <img 
                  src={post.imageBase64} 
                  alt={post.title}
                  className={styles.postImage}
                />
              )}
              <div className={styles.postContent}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.postText}>{post.content}</p>
                <div className={styles.postDate}>
                  Publicado el: {post.createdAt?.toDate()?.toLocaleDateString()}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
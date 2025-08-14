import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Head from "next/head";
import styles from "../styles/PageBuilder.module.css"; // Cambié el nombre del CSS

export default function BuiltPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pageSections")); // Cambiado a pageSections
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setSections(data);
    } catch (error) {
      console.error("Error al cargar secciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchSections(); 
  }, []);

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>Mi Página Personalizada</title>
        <meta name="description" content="Página construida dinámicamente" />
      </Head>
      
      {loading ? (
        <div className={styles.loading}>Cargando página...</div>
      ) : (
        sections.map(section => (
          <section 
            key={section.id} 
            className={styles.pageSection}
            style={{ 
              backgroundColor: section.backgroundColor || '#ffffff',
              backgroundImage: section.backgroundImage ? `url(${section.backgroundImage})` : 'none',
              color: section.textColor || '#333333'
            }}
          >
            <div className={styles.sectionContent}>
              {section.title && (
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              )}
              
              {section.image && (
                <img 
                  src={section.image} 
                  alt={section.imageAlt || ''}
                  className={styles.sectionImage}
                />
              )}
              
              {section.content && (
                <div className={styles.sectionText}>
                  {section.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
              
              {section.gallery && section.gallery.length > 0 && (
                <div className={styles.gallery}>
                  {section.gallery.map((img, index) => (
                    <img 
                      key={index}
                      src={img.url} 
                      alt={img.alt || `Imagen ${index + 1}`}
                      className={styles.galleryImage}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
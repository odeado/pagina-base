import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Head from "next/head";
import styles from "../styles/PageBuilder.module.css"; // Cambié el nombre del CSS

export default function BuiltPage() {
  const [sections, setSections] = useState([]);
  const [logo, setLogo] = useState("");
  const [menuItems, setMenuItems] = useState([]);
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

   useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el logo
        const logoSnapshot = await getDocs(collection(db, "siteSettings"));
        logoSnapshot.forEach(doc => {
          if (doc.data().type === "logo") {
            setLogo(doc.data().image);
          }
        });

        // Obtener el menú
        const menuSnapshot = await getDocs(collection(db, "pages"));
        setMenuItems(menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <header>
        {logo && <img src={logo} alt="Site Logo" className="logo" />}
        <nav>
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>
                <a href={item.path}>{item.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
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
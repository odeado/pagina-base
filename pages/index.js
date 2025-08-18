import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Head from "next/head";
import styles from "../styles/PageBuilder.module.css"; // Cambié el nombre del CSS

export default function BuiltPage() {
  const [sections, setSections] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({
  logo: "",
  siteTitle: "Mi Sitio Web"
});
const [selectedImage, setSelectedImage] = useState(null); // Estado para la imagen seleccionada
const [currentImageIndex, setCurrentImageIndex] = useState(0); // Estado para el índice de la imagen actual
const [currentGallery, setCurrentGallery] = useState([]); // Estado para la galería de imágenes

// Refs para el touch
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const modalRef = useRef(null);

 // Función para cargar las secciones
  const fetchSections = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pageSections")); 
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setSections(data);
    } catch (error) {
      console.error("Error al cargar secciones:", error);
    } 
  };


// Función para cargar la configuración del sitio
  const fetchSiteSettings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "siteSettings"));
      if (!querySnapshot.empty) {
        setSiteSettings(querySnapshot.docs[0].data());
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    }
  };

 // Función para cargar las páginas del menú
  const fetchMenuItems = async () => {
    try {
      const menuSnapshot = await getDocs(collection(db, "pages"));
      setMenuItems(menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error cargando menú:", error);
    }
  };


  // Cargar todos los datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSections(),
        fetchSiteSettings(),
        fetchMenuItems()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, []);


// Función para abrir imagen en grande
    const openImageModal = (img, gallery, index) => {
    setSelectedImage(img);
    setCurrentImageIndex(index);
    setCurrentGallery(gallery);
  };

  // Función para cerrar el modal
const closeImageModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
    setGalleryImages([]);
  };

 // Funciones para navegación entre imágenes
  const goToPrevious = () => {
    const newIndex = (currentImageIndex - 1 + currentGallery.length) % currentGallery.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(currentGallery[newIndex]);
  };

  const goToNext = () => {
    const newIndex = (currentImageIndex + 1) % currentGallery.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(currentGallery[newIndex]);
  };

  // Handlers para touch events
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const difference = touchStartX.current - touchEndX.current;
    
    if (difference > 50) {
      // Deslizamiento hacia la izquierda (siguiente imagen)
      goToNext();
    } else if (difference < -50) {
      // Deslizamiento hacia la derecha (imagen anterior)
      goToPrevious();
    }
    
    // Resetear valores
    touchStartX.current = 0;
    touchEndX.current = 0;
  };




 if (loading) return <div className={styles.loading}>Cargando página...</div>;

  return (
    <div className={styles.pageContainer}
    style={{ backgroundColor: siteSettings.contentBackground || '#ffffff' }}
    >
       <Head>
        <title>{siteSettings.siteTitle}</title>
        <meta name="description" content="Página construida dinámicamente" />
      </Head>
    <header className={styles.header}>
        <div className={styles.headerContent}>
          {siteSettings.logo && (
            <img 
              src={siteSettings.logo} 
              alt="Logo" 
              className={styles.logo} 
            />
          )}
          <h1 className={styles.siteTitle}>{siteSettings.siteTitle}</h1>
          
          <nav className={styles.navMenu}>
            <ul>
              {menuItems.map(item => (
                <li key={item.id}>
                  <a href={item.path}>{item.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      
          <main>
        {sections.map(section => (
          <section 
            key={section.id} 
            className={styles.pageSection}
            style={{ 
              backgroundColor: section.backgroundColor || '#ffffff',
              color: section.textColor || '#333333'
            }}
          >
            <div 
              className={styles.sectionContent}
              style={{
                backgroundColor: section.contentBackground || 'transparent',
              }}
            >
              {section.title && (
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              )}

              {renderSectionContent(section)}
              
              {section.gallery && section.gallery.length > 0 && (
    <div className={styles.gallery}>
      {section.gallery.map((img, index) => (
        <img 
          key={index}
          src={img.url} 
          alt={img.alt || `Imagen ${index + 1}`}
          className={styles.galleryImage}
          onClick={() => openImageModal(img, section.gallery, index)} // Pasar gallery e index
        />
      ))}
    </div>
  )}
            </div>
          </section>
        ))}
      </main>


 {/* Modal para imagen en grande */}
           {selectedImage && (
        <div 
          className={styles.imageModal} 
          onClick={closeImageModal}
          ref={modalRef}
        >
          <div 
            className={styles.modalContent} 
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <span className={styles.closeButton} onClick={closeImageModal}>&times;</span>
            <button className={styles.navButtonLeft} onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}>&#10094;</button>
            
            <img 
              src={selectedImage.url} 
              alt={selectedImage.alt || "Imagen en grande"} 
              className={styles.modalImage}
            />
            
            <button className={styles.navButtonRight} onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}>&#10095;</button>
            
            <div className={styles.imageCounter}>
              {currentImageIndex + 1} / {currentGallery.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Función auxiliar para renderizar el contenido según el layout
function renderSectionContent(section) {
  switch(section.layout) {
    case 'image-text':
      return (
        <div className={styles.flexContainer}>
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
        </div>
      );
    
    case 'text-image':
      return (
        <div className={styles.flexContainer}>
          {section.content && (
            <div className={styles.sectionText}>
              {section.content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
          {section.image && (
            <img 
              src={section.image} 
              alt={section.imageAlt || ''}
              className={styles.sectionImage}
            />
          )}
        </div>
      );
    
    case 'image-only':
      return section.image && (
        <img 
          src={section.image} 
          alt={section.imageAlt || ''}
          className={styles.sectionImage}
        />
      );
    
    case 'text-only':
      return section.content && (
        <div className={styles.sectionText}>
          {section.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      );
    
    default:
      return (
        <>
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
        </>
      );
  }
}
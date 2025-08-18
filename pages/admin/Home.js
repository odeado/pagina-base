import { serverTimestamp } from 'firebase/firestore';
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../../styles/AdminPanel.module.css";


export default function AdminPanel() {
  
  // Estado para siteSettings (logo y título del sitio)
  const [siteSettings, setSiteSettings] = useState({
    logo: "",
    siteTitle: "Mi Sitio Web",
    backgroundType: "solid",
    backgroundColor: "#ffffff",
    gradientColors: ["#ffffff", "#f0f0f0"],
    gradientDirection: "to right",
    settingsId: null
  });

  // Estado para las secciones de contenido
  const [section, setSection] = useState({
    title: "",
    content: "",
    backgroundType: "solid",
    backgroundColor: "#ffffff",
    gradientColors: ["#ffffff", "#f0f0f0"],
    gradientDirection: "to right",
    contentBackground: "#ffffff",
    textColor: "#333333",
    image: "",
    gallery: [],
    layout: "text-image",
    border: {
      top: false,
      bottom: false,
      color: "#dddddd",
      width: "1px",
      style: "solid",
    },
    titleStyle: {
    size: "h2", // h1, h2, h3, h4
    alignment: "left", // left, center, right
    color: "#333333",
    fontFamily: "Arial, sans-serif",
    underline: false
  }
  });

  const [galleryImage, setGalleryImage] = useState("");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const router = useRouter();

  // Estados para el menú
  const [pages, setPages] = useState([]);
  const [newPage, setNewPage] = useState({
    title: "",
    path: "",
    isMain: false
  });

  // Función para cargar las páginas existentes
  const fetchPages = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pages"));
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setPages(data);
    } catch (error) {
      console.error("Error cargando páginas:", error);
    }
  };

  // Función para agregar nueva página al menú
  const addPage = async () => {
    if (!newPage.title || !newPage.path) {
      alert("Título y path son requeridos");
      return;
    }
    
    try {
      await addDoc(collection(db, "pages"), {
        ...newPage,
        createdAt: new Date()
      });
      setNewPage({ title: "", path: "", isMain: false });
      fetchPages();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar página");
    }
  };

  // Cargar páginas al montar el componente
  useEffect(() => { 
    fetchSections();
    fetchPages();
    fetchSiteSettings();
  }, []);

  // Cargar configuración existente
  const fetchSiteSettings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "siteSettings"));
      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        console.log("Configuración cargada:", docData);
        setSiteSettings({
          logo: docData.logo || "",
          siteTitle: docData.siteTitle || "Mi Sitio Web",
          contentBackground: docData.contentBackground || "#ffffff",
          settingsId: querySnapshot.docs[0].id,
          logoLoading: false
        });
      }
    } catch (error) {
      console.error("Error cargando configuración:", error);
    }
  };

  // Guardar o actualizar configuración
  const saveSiteSettings = async () => {
    if (!siteSettings.logo) {
      alert("Debes seleccionar un logo");
      return;
    }

    setLogoLoading(true);
    
    try {
      const settingsData = {
        logo: siteSettings.logo,
        siteTitle: siteSettings.siteTitle,
        contentBackground: siteSettings.contentBackground,
        updatedAt: new Date()
      };

      console.log("Guardando configuración:", settingsData);

      if (siteSettings.settingsId) {
        await updateDoc(doc(db, "siteSettings", siteSettings.settingsId), settingsData);
      } else {
        const docRef = await addDoc(collection(db, "siteSettings"), settingsData);
        setSiteSettings(prev => ({...prev, settingsId: docRef.id}));
      }
      
      alert("Configuración guardada correctamente");
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar configuración");
    } finally {
      setLogoLoading(false);
    }
  };

  // Cargar configuración al inicio
  useEffect(() => { 
    fetchSections();
    fetchPages();
    fetchSiteSettings();
  }, []);


  // Componente para estilos de título
const TitleStyleControls = ({ style, onChange }) => {
  return (
    <div className={styles.titleStyleControls}>
      <h4>Estilo del título</h4>
      
      <div className={styles.formGroup}>
        <label>Tamaño:</label>
        <select
          value={style.size}
          onChange={(e) => onChange({...style, size: e.target.value})}
        >
          <option value="h1">Título 1 (Grande)</option>
          <option value="h2">Título 2 (Mediano)</option>
          <option value="h3">Título 3 (Pequeño)</option>
          <option value="h4">Título 4 (Muy pequeño)</option>
        </select>
      </div>
      
      <div className={styles.formGroup}>
        <label>Alineación:</label>
        <select
          value={style.alignment}
          onChange={(e) => onChange({...style, alignment: e.target.value})}
        >
          <option value="left">Izquierda</option>
          <option value="center">Centro</option>
          <option value="right">Derecha</option>
        </select>
      </div>
      
      <div className={styles.formGroup}>
        <label>Color:</label>
        <input
          type="color"
          value={style.color}
          onChange={(e) => onChange({...style, color: e.target.value})}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label>
          <input
            type="checkbox"
            checked={style.underline}
            onChange={(e) => onChange({...style, underline: e.target.checked})}
          />
          Subrayado
        </label>
      </div>
    </div>
  );
};

  // Componente para gradientes
  const GradientControls = ({ settings, onChange }) => {
    return (
      <div className={styles.gradientControls}>
        <div className={styles.formGroup}>
          <label>Dirección del degradado:</label>
          <select
            value={settings.gradientDirection}
            onChange={(e) => onChange({...settings, gradientDirection: e.target.value})}
          >
            <option value="to right">Horizontal (→)</option>
            <option value="to left">Horizontal (←)</option>
            <option value="to bottom">Vertical (↓)</option>
            <option value="to top">Vertical (↑)</option>
            <option value="to bottom right">Diagonal (↘)</option>
            <option value="to top left">Diagonal (↖)</option>
          </select>
        </div>
        
        <div className={styles.colorInputs}>
          <div>
            <label>Color 1:</label>
            <input
              type="color"
              value={settings.gradientColors[0]}
              onChange={(e) => onChange({
                ...settings, 
                gradientColors: [e.target.value, settings.gradientColors[1]]
              })}
            />
          </div>
          <div>
            <label>Color 2:</label>
            <input
              type="color"
              value={settings.gradientColors[1]}
              onChange={(e) => onChange({
                ...settings, 
                gradientColors: [settings.gradientColors[0], e.target.value]
              })}
            />
          </div>
        </div>
      </div>
    );
  };

  // Función para comprimir imágenes
 const compressImage = async (file, maxWidth = 800, quality = 0.7) => {
  if (!file.type.match('image.*')) {
    throw new Error("El archivo no es una imagen");
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar si es necesario
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a formato JPEG con calidad ajustable
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al comprimir la imagen"));
              return;
            }
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

  const BorderControls = ({ border, onChange }) => {
    return (
      <div className={styles.borderControls}>
        <h4>Configuración de bordes</h4>
        
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={border.top}
              onChange={(e) => onChange({...border, top: e.target.checked})}
            />
            Borde superior
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={border.bottom}
              onChange={(e) => onChange({...border, bottom: e.target.checked})}
            />
            Borde inferior
          </label>
        </div>
        
        { (border.top || border.bottom) && (
          <div className={styles.borderStyle}>
            <div className={styles.formGroup}>
              <label>Color del borde:</label>
              <input
                type="color"
                value={border.color}
                onChange={(e) => onChange({...border, color: e.target.value})}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Grosor:</label>
              <select
                value={border.width}
                onChange={(e) => onChange({...border, width: e.target.value})}
              >
                <option value="1px">Fino (1px)</option>
                <option value="2px">Mediano (2px)</option>
                <option value="3px">Grueso (3px)</option>
                <option value="4px">Muy grueso (4px)</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Estilo:</label>
              <select
                value={border.style}
                onChange={(e) => onChange({...border, style: e.target.value})}
              >
                <option value="solid">Sólido</option>
                <option value="dashed">Segmentado</option>
                <option value="dotted">Punteado</option>
                <option value="double">Doble</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  const sectionStyle = {
    color: section.textColor,
    padding: '2rem',
    margin: '1rem 0',
    ...(section.backgroundType === 'solid' 
      ? { backgroundColor: section.backgroundColor }
      : { 
          background: `linear-gradient(${section.gradientDirection}, ${section.gradientColors.join(', ')})`
        }
    ),
    ...(section.border.top && {
      borderTop: `${section.border.width} ${section.border.style} ${section.border.color}`
    }),
    ...(section.border.bottom && {
      borderBottom: `${section.border.width} ${section.border.style} ${section.border.color}`
    })
  };

  // Función para manejar el cambio de logo
  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLogoLoading(true);
    try {
      const compressedImage = await compressImage(file);
      setSiteSettings({...siteSettings, logo: compressedImage});
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      alert("Error al procesar la imagen");
    } finally {
      setLogoLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const compressedImage = await compressImage(file);
      setSection({...section, image: compressedImage});
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      alert("Error al procesar la imagen");
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const compressedImage = await compressImage(file);
      setGalleryImage(compressedImage);
    } catch (error) {
      console.error("Error comprimiendo imagen:", error);
      alert("Error al procesar la imagen");
    } finally {
      setLoading(false);
    }
  };

  const addGalleryImage = () => {
    if (galleryImage) {
      setSection({
        ...section,
        gallery: [...section.gallery, { url: galleryImage, alt: "" }]
      });
      setGalleryImage("");
    }
  };

  const saveSection = async () => {
    if (!section.title) {
      alert("El título es requerido");
      return;
    }
    
    setLoading(true);
    try {
      
      const sectionData = {
      title: section.title,
      content: section.content,
      backgroundType: section.backgroundType,
      backgroundColor: section.backgroundColor,
      gradientColors: section.gradientColors,
      gradientDirection: section.gradientDirection,
      contentBackground: section.contentBackground,
      textColor: section.textColor,
      image: section.image,
      gallery: section.gallery,
      layout: section.layout,
      border: section.border,
      updatedAt: serverTimestamp(),
    };

      if (editingId) {
      await updateDoc(doc(db, "pageSections", editingId), sectionData);
    } else {
      // Para nuevos documentos, añadir createdAt
      await addDoc(collection(db, "pageSections"), {
        ...sectionData,
        createdAt: serverTimestamp()
      });
    }

      // Reset form
      setSection({
        title: "",
        content: "",
        backgroundType: "solid",
        backgroundColor: "#ffffff",
        gradientColors: ["#ffffff", "#f0f0f0"],
        gradientDirection: "to right",
        contentBackground: "#ffffff",
        textColor: "#333333",
        image: "",
        gallery: [],
        layout: "text-image",
        border: {
          top: false,
          bottom: false,
          color: "#dddddd",
          width: "1px",
          style: "solid"
        }
      });
      setEditingId(null);
      fetchSections();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const loadSectionForEdit = (id) => {
    const sectionToEdit = sections.find(sec => sec.id === id);
    if (sectionToEdit) {
      setSection({
        title: sectionToEdit.title,
        content: sectionToEdit.content,
        backgroundType: sectionToEdit.backgroundType || "solid",
        backgroundColor: sectionToEdit.backgroundColor || "#ffffff",
        gradientColors: sectionToEdit.gradientColors || ["#ffffff", "#f0f0f0"],
        gradientDirection: sectionToEdit.gradientDirection || "to right",
        contentBackground: sectionToEdit.contentBackground || "#f0f0f0",
        textColor: sectionToEdit.textColor || "#333333",
        image: sectionToEdit.image || "",
        gallery: sectionToEdit.gallery || [],
        layout: sectionToEdit.layout || "text-image",
        border: sectionToEdit.border || {
          top: false,
          bottom: false,
          color: "#dddddd",
          width: "1px",
          style: "solid"
        }
      });
      setEditingId(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSection({
      title: "",
      content: "",
      backgroundColor: "#ffffff",
      contentBackground: "#f0f0f0",
      textColor: "#333333",
      image: "",
      gallery: [],
      layout: "text-image",
      border: {
        top: false,
        bottom: false,
        color: "#dddddd",
        width: "1px",
        style: "solid"
      }
    });
  };

  const deleteSection = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta sección?")) {
      try {
        await deleteDoc(doc(db, "pageSections", id));
        fetchSections();
      } catch (error) {
        console.error("Error eliminando:", error);
      }
    }
  };

  const fetchSections = async () => {
  setLoading(true);
  try {
    const querySnapshot = await getDocs(collection(db, "pageSections"));
    const data = querySnapshot.docs.map(doc => {
      const docData = doc.data();
      
      // Manejo robusto de fechas
      const parseDate = (date) => {
        if (!date) return new Date(0); // Fecha por defecto si no existe
        if (typeof date.toDate === 'function') return date.toDate(); // Si es Timestamp
        if (date instanceof Date) return date; // Si ya es Date
        if (typeof date === 'string') return new Date(date); // Si es string ISO
        if (typeof date === 'number') return new Date(date); // Si es timestamp numérico
        return new Date(0); // Fallback
      };

      
   return {
        id: doc.id,
        ...docData,
        createdAt: parseDate(docData.createdAt),
        updatedAt: parseDate(docData.updatedAt)
      };
    });
    
    // Ordenar por fecha (nuevas primero)
    setSections(data.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    console.error("Error cargando secciones:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { 
    fetchSections(); 
  }, []);

  return (
    <div className={styles.adminContainer}>
      <Head>
        <title>Constructor de Páginas - Admin</title>
      </Head>

      {/* Sección de Configuración General */}
      <div className={styles.settingsSection}>
        <h2>Configuración General del Sitio</h2>
        
        <div className={styles.formGroup}>
          <label>Título del Sitio:</label>
          <input
            type="text"
            value={siteSettings.siteTitle}
            onChange={(e) => setSiteSettings({...siteSettings, siteTitle: e.target.value})}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Logo del Sitio:</label>
          <input
            type="file"
            onChange={handleLogoChange}
            accept="image/*"
          />
          {siteSettings.logo && (
            <div className={styles.imagePreview}>
              <img src={siteSettings.logo} alt="Logo Preview" />
              <button 
                onClick={() => setSiteSettings({...siteSettings, logo: ""})}
                className={styles.removeButton}
              >
                Eliminar logo
              </button>
            </div>
          )}
        </div>
        
        <button 
          onClick={saveSiteSettings}
          disabled={!siteSettings.logo || logoLoading}
          className={styles.saveButton}
        >
          {logoLoading ? "Guardando..." : "Guardar Configuración"}
        </button>
      </div>

      <button 
        onClick={() => router.push('/')}
        className={styles.viewButton}
      >
        Ver Página Pública
      </button>

      <h1 className={styles.adminTitle}>Constructor de Páginas</h1>

      {/* Control de disposición */}
      <div className={styles.formGroup}>
        <label>Disposición de elementos:</label>
        <select
          value={section.layout}
          onChange={(e) => setSection({...section, layout: e.target.value})}
        >
          <option value="text-image">Texto - Imagen</option>
          <option value="image-text">Imagen - Texto</option>
          <option value="text-only">Solo Texto</option>
          <option value="image-only">Solo Imagen</option>
          <option value="gallery-top">Galería arriba</option>
          <option value="gallery-bottom">Galería abajo</option>
        </select>
      </div>

      {/* Vista previa de disposición */}
      <div className={styles.layoutPreview}>
        <h4>Vista previa de disposición:</h4>
        <div 
          className={styles.previewContainer}
          style={{ flexDirection: section.layout === 'image-text' ? 'row' : 'row-reverse' }}
        >
          <div className={styles.previewText}>Texto</div>
          <div className={styles.previewImage}>Imagen</div>
        </div>
      </div>

      <div className={styles.realTimePreview}>
        <h3>Vista previa:</h3>
        <div 
          className={styles.previewSection}
          style={{
            color: section.textColor,
            background: section.backgroundType === 'solid' 
              ? section.backgroundColor 
              : `linear-gradient(${section.gradientDirection}, ${section.gradientColors.join(', ')})`,
            borderTop: section.border.top 
              ? `${section.border.width} ${section.border.style} ${section.border.color}`
              : 'none',
            borderBottom: section.border.bottom 
              ? `${section.border.width} ${section.border.style} ${section.border.color}`
              : 'none',
            padding: '1rem'
          }}
        >
            <h4 
      style={{
        fontSize: section.titleStyle.size === 'h1' ? '2rem' : 
                 section.titleStyle.size === 'h2' ? '1.5rem' :
                 section.titleStyle.size === 'h3' ? '1.2rem' : '1rem',
        textAlign: section.titleStyle.alignment,
        color: section.titleStyle.color,
        textDecoration: section.titleStyle.underline ? 'underline' : 'none',
        fontFamily: section.titleStyle.fontFamily
      }}
    >
      {section.title || 'Título de ejemplo'}
    </h4>
          <p>{section.content || 'Este es un texto de ejemplo para la vista previa...'}</p>
          {section.image && (
            <img 
              src={section.image} 
              alt="Preview" 
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          )}
        </div>
      </div>

      {/* Sección del Menú */}
      <div className={styles.menuSection}>
        <h2>Menú de Navegación</h2>
        <div className={styles.formGroup}>
          <label>Título de la página:</label>
          <input
            type="text"
            value={newPage.title}
            onChange={(e) => setNewPage({...newPage, title: e.target.value})}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Path (ej: /about):</label>
          <input
            type="text"
            value={newPage.path}
            onChange={(e) => setNewPage({...newPage, path: e.target.value})}
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={newPage.isMain}
              onChange={(e) => setNewPage({...newPage, isMain: e.target.checked})}
            />
            ¿Menú principal?
          </label>
        </div>
        <button onClick={addPage} className={styles.saveButton}>
          Agregar al Menú
        </button>

        {pages.length > 0 && (
          <div className={styles.pagesList}>
            <h3>Páginas existentes:</h3>
            <ul>
              {pages.map(page => (
                <li key={page.id}>
                  {page.title} - {page.path} 
                  {page.isMain && " (Principal)"}
                  <button 
                    onClick={() => deleteDoc(doc(db, "pages", page.id))}
                    className={styles.deleteButton}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.formContainer}>
        <h2>Nueva Sección</h2>
        
        <div className={styles.formGroup}>
          <label>Título de la sección:</label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => setSection({...section, title: e.target.value})}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Contenido (puede usar múltiples líneas):</label>
          <textarea
            value={section.content}
            onChange={(e) => setSection({...section, content: e.target.value})}
            rows={5}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Tipo de fondo:</label>
          <select
            value={section.backgroundType}
            onChange={(e) => setSection({...section, backgroundType: e.target.value})}
          >
            <option value="solid">Color sólido</option>
            <option value="gradient">Degradado</option>
          </select>
          
          {section.backgroundType === "solid" ? (
            <div className={styles.colorInput}>
              <label>Color de fondo:</label>
              <input
                type="color"
                value={section.backgroundColor}
                onChange={(e) => setSection({...section, backgroundColor: e.target.value})}
              />
            </div>
          ) : (
            <GradientControls 
              settings={section}
              onChange={(newSettings) => setSection(newSettings)}
            />
          )}
        </div>
        
        <BorderControls 
          border={section.border}
          onChange={(newBorder) => setSection({...section, border: newBorder})}
        />

        <TitleStyleControls 
    style={section.titleStyle}
    onChange={(newStyle) => setSection({...section, titleStyle: newStyle})}
  />
        
        <div className={styles.colorInput}>
          <label>Color de fondo del contenido:</label>
          <input
            type="color"
            value={section.contentBackground}
            onChange={(e) => setSection({...section, contentBackground: e.target.value})}
          />
          <span>{section.contentBackground}</span>
        </div>
        
        <div className={styles.colorInput}>
          <label>Color de texto:</label>
          <input
            type="color"
            value={section.textColor}
            onChange={(e) => setSection({...section, textColor: e.target.value})}
          />
          <span>{section.textColor}</span>
        </div>
        
        <div className={styles.formGroup}>
          <label>Imagen principal:</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
          />
          {section.image && (
            <div className={styles.imagePreview}>
              <img 
                src={section.image} 
                alt="Preview" 
              />
              <button 
                onClick={() => setSection({...section, image: ""})}
                className={styles.removeButton}
              >
                Eliminar imagen
              </button>
            </div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label>Galería de imágenes:</label>
          <div className={styles.galleryControls}>
            <input
              type="file"
              onChange={handleGalleryImageChange}
              accept="image/*"
            />
            <button 
              onClick={addGalleryImage}
              disabled={!galleryImage}
              className={styles.addButton}
            >
              Agregar a galería
            </button>
          </div>
          
          {section.gallery.length > 0 && (
            <div className={styles.galleryPreview}>
              {section.gallery.map((img, index) => (
                <div key={index} className={styles.galleryItem}>
                  <img src={img.url} alt={`Preview ${index}`} />
                  <button
                    onClick={() => setSection({
                      ...section,
                      gallery: section.gallery.filter((_, i) => i !== index)
                    })}
                    className={styles.removeSmallButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={saveSection}
          disabled={loading}
          className={styles.saveButton}
        >
          {loading ? "Guardando..." : editingId ? "Actualizar Sección" : "Guardar Sección"}
        </button>

        {editingId && (
          <button 
            onClick={cancelEdit}
            className={styles.cancelButton}
          >
            Cancelar Edición
          </button>
        )}
      </div>

      <div className={styles.sectionsList}>
        <h2>Secciones Existentes ({sections.length})</h2>
        
        {loading && sections.length === 0 ? (
          <p>Cargando secciones...</p>
        ) : (
          <div className={styles.sectionsGrid}>
            {sections.map(sec => (
              <div 
                key={sec.id}
                className={styles.sectionCard}
                style={{
                  backgroundColor: sec.backgroundColor || '#ffffff',
                  color: sec.textColor || '#333333'
                }}
              >
                <h3>{sec.title}</h3>
                {sec.image && (
                  <img 
                    src={sec.image} 
                    alt="Sección"
                    className={styles.sectionImage}
                  />
                )}
                <p>{sec.content?.split('\n')[0]}...</p>
                <div className={styles.sectionActions}>
                  <small>
                    {sec.createdAt?.toLocaleString?.() || "Fecha desconocida"}
                  </small>
                  <div>
                    <button 
                      onClick={() => loadSectionForEdit(sec.id)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => deleteSection(sec.id)}
                      className={styles.deleteButton}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
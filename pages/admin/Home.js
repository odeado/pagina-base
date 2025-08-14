import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../../styles/AdminPanel.module.css";

export default function AdminPanel() {
  const [section, setSection] = useState({
    title: "",
    content: "",
    backgroundColor: "#ffffff",
    textColor: "#333333",
    image: "",
    gallery: []
  });
  const [galleryImage, setGalleryImage] = useState("");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [editingId, setEditingId] = useState(null);
  const [logo, setLogo] = useState("");
  const [logoLoading, setLogoLoading] = useState(false);


  // Función para manejar el cambio de logo
const handleLogoChange = (e) => {
  const file = e.target.files[0];
  if (file && file.size > 500000) {
    alert("El logo debe ser menor a 500KB");
    return;
  }
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

// Función para guardar el logo
const saveLogo = async () => {
  if (!logo) {
    alert("Debes seleccionar un logo primero");
    return;
  }
  
  setLogoLoading(true);
  try {
    // Guardamos el logo en una colección especial
    await addDoc(collection(db, "siteSettings"), {
      type: "logo",
      image: logo,
      createdAt: new Date()
    });
    alert("Logo guardado correctamente");
  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar el logo");
  } finally {
    setLogoLoading(false);
  }
};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 500000) {
      alert("La imagen debe ser menor a 500KB");
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSection({...section, image: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 500000) {
      alert("La imagen debe ser menor a 500KB");
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImage(reader.result);
      };
      reader.readAsDataURL(file);
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
      if (editingId) {
        // Modo edición - actualizar documento existente
        await updateDoc(doc(db, "pageSections", editingId), {
          ...section,
          updatedAt: new Date()
        });
        setEditingId(null); // Salir del modo edición
      } else {
        // Modo creación - agregar nuevo documento
        await addDoc(collection(db, "pageSections"), {
          ...section,
          createdAt: new Date()
        });
      }

      // Reset form
      setSection({
        title: "",
        content: "",
        backgroundColor: "#ffffff",
        textColor: "#333333",
        image: "",
        gallery: []
      });
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
      backgroundColor: sectionToEdit.backgroundColor || "#ffffff",
      textColor: sectionToEdit.textColor || "#333333",
      image: sectionToEdit.image || "",
      gallery: sectionToEdit.gallery || []
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
    textColor: "#333333",
    image: "",
    gallery: []
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
      const data = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      // Ordenar por fecha de creación
      setSections(data.sort((a, b) => 
        a.createdAt?.toDate() - b.createdAt?.toDate()
      ));
    } catch (error) {
      console.error("Error:", error);
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
      
      <button 
        onClick={() => router.push('/')}
        className={styles.viewButton}
      >
        Ver Página Pública
      </button>

      <h1 className={styles.adminTitle}>Constructor de Páginas</h1>
      
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
        
        <div className={styles.colorGroup}>
          <div className={styles.colorInput}>
            <label>Color de fondo:</label>
            <input
              type="color"
              value={section.backgroundColor}
              onChange={(e) => setSection({...section, backgroundColor: e.target.value})}
            />
            <span>{section.backgroundColor}</span>
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
                    {sec.createdAt?.toDate()?.toLocaleString()}
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
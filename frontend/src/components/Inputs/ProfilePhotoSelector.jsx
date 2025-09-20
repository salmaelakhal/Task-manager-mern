import React, { useRef, useState } from "react";
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

function ProfilePhotoSelector({ image, setImage }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de l\'image ne doit pas dépasser 5MB');
        return;
      }
      
      // Mettre à jour l'état de l'image
      setImage(file);

      // Générer l'URL d'aperçu à partir du fichier sélectionné
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    // Réinitialiser l'input file
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center justify-center mb-6">
      {/* Input file caché mais centralisé dans le flux du document */}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!image ? (
        <div 
          className="w-24 h-24 flex items-center justify-center bg-blue-100/50 rounded-full relative cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 transition-colors"
          onClick={onChooseFile}
        >
          <LuUser className="text-3xl text-blue-500" />
          
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full absolute -bottom-2 -right-2 cursor-pointer hover:bg-blue-600 transition-colors">
            <LuUpload size={14} />
          </div>
        </div>
      ) : (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Aperçu de la photo de profil" 
            className="w-24 h-24 object-cover rounded-full border-2 border-blue-300"
          />
          
          <button 
            type="button"
            onClick={handleRemoveImage} 
            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-2 -right-2 hover:bg-red-600 transition-colors"
          >
            <LuTrash size={14} />
          </button>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        {image ? "Cliquez sur l'icône pour changer" : "Cliquez pour ajouter une photo"}
      </p>
    </div>
  );
}

export default ProfilePhotoSelector;
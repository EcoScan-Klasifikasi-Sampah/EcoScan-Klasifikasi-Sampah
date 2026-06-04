import io
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from tensorflow.keras.models import load_model
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Image Classification API")

# CORS Configuration 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ganti dengan ["http://localhost:3000"] jika ingin lebih aman
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model saat aplikasi dijalankan
model_path = "best_model.keras"
try:
    model = load_model(model_path, compile=False)
    print("Model berhasil dimuat.")
except Exception as e:
    print(f"Error memuat model: {e}")
    model = None

# nama class
class_names = ['Anorganik', 'B3', 'Kertas', 'Organik', 'Residu']

@app.get("/")
def read_root():
    return {"message": "Selamat datang di Image Classification API. Gunakan endpoint /predict untuk memprediksi gambar."}

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model belum dimuat dengan benar.")
    
    # Validasi bahwa file adalah gambar
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diunggah harus berupa gambar.")

    try:
        # Membaca isi file gambar
        contents = await file.read()
        
        # Membuka gambar dengan PIL dan memastikan format RGB
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Mengubah ukuran gambar sesuai target_size di model (300, 300)
        img = img.resize((300, 300))
        
        # Konversi gambar ke array 
        img_array = np.array(img, dtype=np.float32)
        
        # Normalisasi 
        img_array = img_array / 255.0
        
        # Menambahkan dimensi batch (1, 300, 300, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        # Prediksi menggunakan model
        prediction = model.predict(img_array)
        
        # Mendapatkan index kelas dengan probabilitas tertinggi
        predicted_index = int(np.argmax(prediction))
        
        # Menentukan nama kelas
        if predicted_index < len(class_names):
            predicted_class = class_names[predicted_index]
        else:
            predicted_class = f"Class Index {predicted_index}"
            
        return {
            "filename": file.filename,
            "predicted_class": predicted_class,
            "confidence": float(np.max(prediction)),
            "raw_predictions": prediction.tolist()[0]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat memproses gambar: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Menjalankan server secara lokal
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
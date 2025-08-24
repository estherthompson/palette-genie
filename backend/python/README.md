# Palette Genie AI Backend

AI-powered paint mixing calculator backend built with FastAPI, TensorFlow, and OpenCV.

## 🎨 Features

- **Image Color Analysis**: Extract dominant colors from uploaded photos using AI
- **Paint Mixing Calculator**: Generate precise paint mixing ratios for any color
- **Color Theory Engine**: Create harmonious color palettes using color theory
- **Multiple Mixing Algorithms**: K-nearest, linear combination, and optimization approaches
- **Professional Paint Database**: 10+ base paint colors with accurate properties

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. **Navigate to the Python backend directory:**
   ```bash
   cd palette-genie/backend/python
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the development server:**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## 📚 API Endpoints

### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed service status

### Color Analysis
- `POST /api/analyze-colors` - Analyze colors from uploaded image
- `POST /api/generate-palette` - Generate harmonious color palette
- `GET /api/color-theory/{color_name}` - Get color theory information

## 🔧 API Documentation

Once the server is running, visit:
- **Interactive API docs**: `http://localhost:8000/docs`
- **ReDoc documentation**: `http://localhost:8000/redoc`

## 🏗️ Architecture

```
Frontend (React) → Python FastAPI → AI Services → Results
     ↓                    ↓              ↓         ↓
  Upload Image    Image Processing   Color      Paint Mixing
  Show Results    Validation        Analysis   Ratios
```

### Core Components

- **`main.py`**: FastAPI application and endpoints
- **`models/color_models.py`**: Pydantic data models
- **`services/color_analyzer.py`**: AI color analysis using TensorFlow/OpenCV
- **`services/paint_mixer.py`**: Paint mixing ratio calculations
- **`utils/image_processor.py`**: Image processing and validation

## 🎯 How It Works

1. **Image Upload**: User uploads a reference photo
2. **AI Analysis**: TensorFlow + OpenCV extracts dominant colors
3. **Color Processing**: Convert to multiple color formats (RGB, HEX, HSL, CMYK)
4. **Paint Mixing**: Calculate precise mixing ratios using base paints
5. **Results**: Return mixing instructions, difficulty, and cost estimates

## 🎨 Paint Mixing Algorithms

### 1. K-Nearest Neighbors
- Finds 3 closest base paint colors
- Calculates ratios based on color distance
- Fast and reliable for most cases

### 2. Linear Combination
- Uses linear algebra to solve for optimal ratios
- More precise than k-nearest
- Handles complex color relationships

### 3. Optimization
- Samples multiple paint combinations
- Finds best match through iteration
- Most accurate but computationally intensive

## 🔍 Base Paint Colors

The system includes 10 professional base paint colors:
- Titanium White, Ivory Black
- Cadmium Red, Cadmium Yellow
- Ultramarine Blue, Phthalo Green
- Burnt Sienna, Raw Umber
- Cobalt Blue, Viridian Green

## 🚀 Development

### Running in Development Mode
```bash
python main.py
```

### Running with Uvicorn
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Testing the API
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test color analysis (requires image file)
curl -X POST "http://localhost:8000/api/analyze-colors" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "image=@your_image.jpg"
```

## 🔗 Integration with Frontend

The backend is designed to work with your React frontend:
- **CORS enabled** for `http://localhost:3000`
- **File upload support** for images
- **JSON responses** for easy frontend integration
- **Error handling** with descriptive messages

## 📊 Performance

- **Image Processing**: Supports up to 10MB images
- **Color Analysis**: Processes images in seconds
- **Mixing Calculations**: Real-time ratio generation
- **Scalability**: Async/await for concurrent requests

## 🛠️ Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed
2. **Port Conflicts**: Change port in `main.py` if 8000 is busy
3. **Image Upload Issues**: Check file size and format restrictions
4. **Memory Issues**: Large images may require more RAM

### Dependencies

Key libraries used:
- **FastAPI**: Modern web framework
- **OpenCV**: Image processing
- **NumPy**: Numerical computations
- **Scikit-learn**: Machine learning algorithms
- **Pillow**: Image handling

## 🔮 Future Enhancements

- **Custom Paint Brands**: Add more paint manufacturers
- **Advanced Color Theory**: Implement more sophisticated algorithms
- **Batch Processing**: Handle multiple images simultaneously
- **Machine Learning**: Train custom models on paint mixing data
- **Cost Optimization**: Find cheapest paint combinations

## 📝 License

This project is part of Palette Genie - AI-powered paint mixing calculator.

---

**Happy Painting! 🎨✨** 
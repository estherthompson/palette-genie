import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [brandInfo, setBrandInfo] = useState<any>(null);
  const [userPreferences, setUserPreferences] = useState({
    total_ml: 5,
    drops_per_ml: 20,
    preferred_unit: 'drops'
  });
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchBrand = async (brandName: string) => {
    if (!brandName.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/search-paint-brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const brandData = await response.json();
      console.log('Found brand info:', brandData);
      
      // Store the brand information and set as selected
      setBrandInfo(brandData);
      setSelectedBrand(brandData.name);
      
    } catch (err) {
      console.error('Error searching brand:', err);
      setError('Failed to search for paint brand. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      // Use brand-specific endpoint if brand is selected
      const endpoint = selectedBrand 
        ? 'http://localhost:8000/api/analyze-colors-with-brand'
        : 'http://localhost:8000/api/analyze-colors';
      
      if (selectedBrand) {
        formData.append('brand_name', selectedBrand);
        formData.append('algorithm', 'brand_specific');
        
        // Add user preferences
        formData.append('user_preferences', JSON.stringify(userPreferences));
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalysisResults(data);
      console.log('Analysis results:', data);
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };



  return (
    <>
      <Head>
        <title>Home - Palette Genie</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-[#fef6e9] via-[#ffc6ac] to-[#faae7b]">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/palette-genie.png"
                  alt="Palette Genie Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <h1 className="text-2xl font-bold text-gray-800">Palette Genie</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/user')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  My Paints
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Palette Genie
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload a reference photo and get exact paint mixing instructions using your preferred paint brand
            </p>
          </div>

          {/* How It Works Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">How Palette Genie Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Pick Your Paint Brand</h4>
                <p className="text-gray-600">Choose from Northhaven, Liquitex, Golden, or other paint brands to get mixing instructions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Upload Your Reference</h4>
                <p className="text-gray-600">Upload a photo of the colors you want to recreate - landscapes, artwork, or any inspiration image</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Get Exact Mixing Instructions</h4>
                <p className="text-gray-600">Receive precise paint mixing ratios using only your chosen brand's available colors</p>
              </div>
            </div>
          </div>

          {/* Paint Brand Search */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              🎨 Step 1: Search for Your Paint Brand
            </h3>
            
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <label htmlFor="brand-search" className="block text-sm font-medium text-gray-700 mb-2">
                  What paint brand do you use?
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    id="brand-search"
                    placeholder="e.g., Northhaven, Liquitex, Golden, Winsor & Newton..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  />
                  <button
                    onClick={() => handleSearchBrand(selectedBrand)}
                    disabled={!selectedBrand.trim()}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Search
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  We'll search for available colors and pricing for your chosen brand
                </p>
              </div>
              
              {selectedBrand && (
                <div className="text-center">
                  <p className="text-green-600 font-medium">
                    ✅ Using {selectedBrand} paints for color mixing
                  </p>
                  <button
                    onClick={() => setSelectedBrand("")}
                    className="mt-2 text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Change brand
                  </button>
                  
                  {/* Paint Brand Information Display */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Paint Brand Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Product Images */}
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Product Images</h5>
                        <div className="flex space-x-2 overflow-x-auto">
                          {brandInfo?.productImages?.map((imageUrl: string, index: number) => (
                            <img
                              key={index}
                              src={imageUrl}
                              alt={`${selectedBrand} product ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.src = '/images/palette-genie.png'; // Fallback image
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Popular Colors */}
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Popular Colors</h5>
                        <div className="flex flex-wrap gap-2">
                          {brandInfo?.popularColors?.map((color: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* User Preferences Section */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">🎨 Mixing Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Volume (ml)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.5"
                      defaultValue="5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, total_ml: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drops per ml
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="30"
                      step="1"
                      defaultValue="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, drops_per_ml: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Unit
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue="drops"
                      onChange={(e) => setUserPreferences(prev => ({ ...prev, preferred_unit: e.target.value }))}
                    >
                      <option value="drops">Drops</option>
                      <option value="ml">Milliliters</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  These preferences will be used for all paint mixing instructions
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload Section - Only show after brand selection */}
          {selectedBrand && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                📸 Step 2: Upload Your Reference Photo
              </h3>
              <p className="text-center text-gray-600 mb-6">
                Upload a photo and we'll analyze the colors using your {selectedBrand} paints
              </p>
              
              <div className="max-w-2xl mx-auto">
                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full h-64 object-contain mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-gray-500">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-lg font-medium text-gray-700">Upload your reference photo</p>
                        <p className="text-sm text-gray-500">PNG, JPG, or JPEG up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>
                
                {/* Generate Analysis Button - Only show after image upload */}
                {selectedImage && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={handleAnalyzeImage}
                      disabled={isAnalyzing}
                      className={`px-8 py-3 rounded-xl font-medium transition-all ${
                        isAnalyzing
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-lg'
                      }`}
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Analyzing Colors...</span>
                        </div>
                      ) : (
                        `🎨 Analyze Colors with ${selectedBrand} Paints`
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}



          {/* Analysis Results Section */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-red-800">Error</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {analysisResults && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                🎨 Color Analysis Results
                {selectedBrand && (
                  <span className="text-blue-600 text-lg ml-2">using {selectedBrand} paints</span>
                )}
              </h3>
              
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  {analysisResults.message || "Colors extracted from your uploaded image with paint mixing instructions"}
                </p>
              </div>
              
              {/* Color Distribution Summary */}
              {analysisResults.color_distribution && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Color Analysis Summary</h4>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{analysisResults.color_distribution.dominant}</div>
                      <div className="text-blue-800">Dominant Colors</div>
                      <div className="text-xs text-blue-600">Most prominent</div>
                    </div>
                    <div className="text-center bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">{analysisResults.color_distribution.secondary}</div>
                      <div className="text-purple-800">Secondary Colors</div>
                      <div className="text-xs text-purple-600">Supporting tones</div>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{analysisResults.color_distribution.tertiary}</div>
                      <div className="text-green-800">Tertiary Colors</div>
                      <div className="text-xs text-green-600">Accent details</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dominant Colors */}
              {analysisResults.dominant_colors && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    🎯 Dominant Colors (Primary Focus)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {analysisResults.dominant_colors.map((color: any, index: number) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-20 h-20 rounded-lg mx-auto mb-2 shadow-md border-2 border-blue-200"
                          style={{ backgroundColor: color.hex || `rgb(${color.r}, ${color.g}, ${color.b})` }}
                        ></div>
                        <p className="text-sm font-medium text-gray-800">
                          {color.hex || `RGB(${color.r}, ${color.g}, ${color.b})`}
                        </p>
                        {color.name && (
                          <p className="text-xs text-gray-500">{color.name}</p>
                        )}
                        <p className="text-xs text-blue-600 font-medium">Dominant</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Colors */}
              {analysisResults.secondary_colors && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    🎨 Secondary Colors (Supporting Elements)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {analysisResults.secondary_colors.map((color: any, index: number) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-20 h-20 rounded-lg mx-auto mb-2 shadow-md border-2 border-purple-200"
                          style={{ backgroundColor: color.hex || `rgb(${color.r}, ${color.g}, ${color.b})` }}
                        ></div>
                        <p className="text-sm font-medium text-gray-800">
                          {color.hex || `RGB(${color.r}, ${color.g}, ${color.b})`}
                        </p>
                        {color.name && (
                          <p className="text-xs text-gray-500">{color.name}</p>
                        )}
                        <p className="text-xs text-purple-600 font-medium">Secondary</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tertiary Colors */}
              {analysisResults.tertiary_colors && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    ✨ Tertiary Colors (Accent Details)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {analysisResults.tertiary_colors.map((color: any, index: number) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-20 h-20 rounded-lg mx-auto mb-2 shadow-md border-2 border-green-200"
                          style={{ backgroundColor: color.hex || `rgb(${color.r}, ${color.g}, ${color.b})` }}
                        ></div>
                        <p className="text-sm font-medium text-gray-800">
                          {color.hex || `RGB(${color.r}, ${color.g}, ${color.b})`}
                        </p>
                        {color.name && (
                          <p className="text-xs text-gray-500">{color.name}</p>
                        )}
                        <p className="text-xs text-green-600 font-medium">Tertiary</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Paint Mixing Instructions */}
              {analysisResults.paint_mixes && (
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">
                    🎨 Paint Mixing Instructions
                    {selectedBrand && (
                      <span className="text-blue-600 text-lg ml-2">using {selectedBrand}</span>
                    )}
                  </h4>
                  <div className="space-y-4">
                    {analysisResults.paint_mixes.map((mix: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center mb-3">
                          <div 
                            className="w-12 h-12 rounded-lg mr-4 shadow-md"
                            style={{ backgroundColor: mix.target_color?.hex || `rgb(${mix.target_color?.r}, ${mix.target_color?.g}, ${mix.target_color?.b})` }}
                          ></div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">
                              Mix for: {mix.target_color?.hex || `RGB(${mix.target_color?.r}, ${mix.target_color?.g}, ${mix.target_color?.b})`}
                            </h5>
                            {mix.target_color?.name && (
                              <p className="text-sm text-gray-500">{mix.target_color.name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {mix.uses_available_paints ? (
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                ✅ Available
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                ⚠️ Generic
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h6 className="font-medium text-gray-700 mb-2">Required Paints:</h6>
                          <div className="space-y-2">
                            {mix.base_colors?.map((paint: any, paintIndex: number) => (
                              <div key={paintIndex} className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-600">{paint.name}</span>
                                  {paint.brand && paint.brand !== "Generic" && (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      {paint.brand}
                                    </span>
                                  )}
                                </div>
                                <span className="font-medium text-gray-800">
                                  {(mix.mixing_ratios?.[paintIndex] * 100).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {mix.mixing_instructions && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h6 className="font-medium text-gray-700 mb-2">Instructions:</h6>
                              <p className="text-sm text-gray-600">{mix.mixing_instructions}</p>
                            </div>
                          )}
                          
                          {mix.missing_paints && mix.missing_paints.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h6 className="font-medium text-red-700 mb-2">Missing Paints:</h6>
                              <p className="text-sm text-red-600">{mix.missing_paints.join(', ')}</p>
                            </div>
                          )}
                          
                          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Difficulty: <span className="font-medium capitalize">{mix.difficulty}</span>
                            </span>
                            {mix.estimated_cost && (
                              <span className="text-gray-600">
                                Estimated Cost: <span className="font-medium">${mix.estimated_cost}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Data for Debugging */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  View Raw Data (Debug)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(analysisResults, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">


            {/* Color Theory Guide Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Color Theory Guide</h3>
              <p className="text-gray-600 mb-4">Learn about complementary colors, triadic schemes, and more</p>
              <button className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-teal-600 hover:shadow-lg transition-all">
                Learn Colors
              </button>
            </div>

            {/* My Palettes Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">My Paint Mixes</h3>
              <p className="text-gray-600 mb-4">Save and organize your custom paint mixing recipes</p>
              <button className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 hover:shadow-lg transition-all">
                View Mixes
              </button>
            </div>
          </div>



          {/* Recent Mixes Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Recent Paint Mixes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sample Mix 1 */}
              <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex space-x-1 mb-3">
                  <div className="w-8 h-12 bg-red-400 rounded"></div>
                  <div className="w-8 h-12 bg-orange-400 rounded"></div>
                  <div className="w-8 h-12 bg-yellow-400 rounded"></div>
                  <div className="w-8 h-12 bg-green-400 rounded"></div>
                  <div className="w-8 h-12 bg-blue-400 rounded"></div>
                </div>
                <h4 className="font-medium text-gray-800">Sunset Sky Mix</h4>
                <p className="text-sm text-gray-500">Red + Yellow + White (2:1:1 ratio)</p>
                <p className="text-xs text-gray-400 mt-1">Created 2 hours ago</p>
              </div>

              {/* Sample Mix 2 */}
              <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex space-x-1 mb-3">
                  <div className="w-8 h-12 bg-purple-400 rounded"></div>
                  <div className="w-8 h-12 bg-pink-400 rounded"></div>
                  <div className="w-8 h-12 bg-red-400 rounded"></div>
                  <div className="w-8 h-12 bg-orange-400 rounded"></div>
                  <div className="w-8 h-12 bg-yellow-400 rounded"></div>
                </div>
                <h4 className="font-medium text-gray-800">Berry Blast Mix</h4>
                <p className="text-sm text-gray-500">Purple + Red + White (3:2:1 ratio)</p>
                <p className="text-xs text-gray-400 mt-1">Created yesterday</p>
              </div>

              {/* Sample Mix 3 */}
              <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex space-x-1 mb-3">
                  <div className="w-8 h-12 bg-teal-400 rounded"></div>
                  <div className="w-8 h-12 bg-blue-400 rounded"></div>
                  <div className="w-8 h-12 bg-indigo-400 rounded"></div>
                  <div className="w-8 h-12 bg-purple-400 rounded"></div>
                  <div className="w-8 h-12 bg-pink-400 rounded"></div>
                </div>
                <h4 className="font-medium text-gray-800">Ocean Wave Mix</h4>
                <p className="text-sm text-gray-500">Blue + Green + White (2:1:2 ratio)</p>
                <p className="text-xs text-gray-400 mt-1">Created 3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
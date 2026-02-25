import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import PropTypes from 'prop-types'

const AIImageGenerator = ({ onClose, onGenerate, isGenerating }) => {
    const [prompt, setPrompt] = useState('')
    const [imageSize, setImageSize] = useState('1024x1024')
    const [quality, setQuality] = useState('standard')

    const handleGenerate = () => {
        if (prompt.trim()) {
            onGenerate(prompt, imageSize, quality)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Generate AI Image
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                        disabled={isGenerating}
                    >
                        <FeatherIcon icon="x" size="20" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Prompt Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Describe the image you want to create
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A futuristic city at sunset with flying cars"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="4"
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Image Size Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Size
                        </label>
                        <select
                            value={imageSize}
                            onChange={(e) => setImageSize(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            disabled={isGenerating}
                        >
                            <option value="1024x1024">Square (1024x1024)</option>
                            <option value="1792x1024">Landscape (1792x1024)</option>
                            <option value="1024x1792">Portrait (1024x1792)</option>
                        </select>
                    </div>

                    {/* Quality Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quality
                        </label>
                        <select
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            disabled={isGenerating}
                        >
                            <option value="standard">Standard</option>
                            <option value="hd">HD (Higher Quality)</option>
                        </select>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className={`w-full py-3 rounded-md text-white font-medium flex items-center justify-center gap-2 ${!prompt.trim() || isGenerating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <FeatherIcon icon="image" size="20" />
                                Generate Image
                            </>
                        )}
                    </button>

                    {/* Info Text */}
                    <p className="text-xs text-gray-500 text-center">
                        Powered by DALL-E 3. Generated images will be sent in the chat.
                    </p>
                </div>
            </div>
        </div>
    )
}

AIImageGenerator.propTypes = {
    onClose: PropTypes.func.isRequired,
    onGenerate: PropTypes.func.isRequired,
    isGenerating: PropTypes.bool.isRequired
}

export default AIImageGenerator


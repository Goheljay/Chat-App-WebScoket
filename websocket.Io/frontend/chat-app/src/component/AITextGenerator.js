import { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import PropTypes from 'prop-types'

const AITextGenerator = ({ onClose, onGenerate, isGenerating }) => {
    const [prompt, setPrompt] = useState('')
    const [model, setModel] = useState('gpt-3.5-turbo')

    const handleGenerate = () => {
        if (prompt.trim()) {
            onGenerate(prompt, model)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Generate AI Text
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
                            What would you like to ask?
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Write a creative story about a robot learning to paint"
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows="4"
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Model Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Model
                        </label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                            disabled={isGenerating}
                        >
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
                            <option value="gpt-4">GPT-4 (More Accurate)</option>
                        </select>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || isGenerating}
                        className={`w-full py-3 rounded-md text-white font-medium flex items-center justify-center gap-2 ${!prompt.trim() || isGenerating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <FeatherIcon icon="message-circle" size="20" />
                                Generate Text
                            </>
                        )}
                    </button>

                    {/* Info Text */}
                    <p className="text-xs text-gray-500 text-center">
                        Powered by ChatGPT. Generated text will be sent in the chat.
                    </p>
                </div>
            </div>
        </div>
    )
}

AITextGenerator.propTypes = {
    onClose: PropTypes.func.isRequired,
    onGenerate: PropTypes.func.isRequired,
    isGenerating: PropTypes.bool.isRequired
}

export default AITextGenerator


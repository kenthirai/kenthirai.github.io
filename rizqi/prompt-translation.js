document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt');
    const originalGenerateImage = window.generateImage; // Save the original function

    // Function to detect if translation is needed (simplified version)
    function needsTranslation(text) {
        // Basic detection for common non-English characters
        const nonEnglishRegex = /[\u0400-\u04FF\u4E00-\u9FFF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF]/;
        return nonEnglishRegex.test(text);
    }

    // Function to translate text using Pollinations.ai API
    async function translateToEnglish(text) {
        try {
            const messages = [
                { 
                    role: "system", 
                    content: "You are a professional translator. Translate the following text to English accurately while preserving all special terms, names, and technical language. Only respond with the translated text, no additional commentary." 
                },
                { 
                    role: "user", 
                    content: text 
                }
            ];

            const response = await fetch("https://text.pollinations.ai/openai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    temperature: 0.3, // Lower temperature for more consistent translations
                })
            });

            if (!response.ok) {
                throw new Error(`Translation API error: ${response.status}`);
            }

            const result = await response.json();
            const translatedText = result.choices[0].message.content.trim();
            
            // Verify the translation isn't empty and doesn't contain error messages
            if (translatedText && !translatedText.includes("Sorry") && !translatedText.includes("I cannot")) {
                return translatedText;
            }
            return text; // Return original if translation seems invalid
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original if there's an error
        }
    }

    // Override the generateImage function
    window.generateImage = async function() {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            showNotification('Please enter a prompt to generate an image', 'error');
            return;
        }

        // Check if the prompt needs translation
        if (needsTranslation(prompt)) {
            try {
                // Show loading notification for translation
                showNotification('Optimizing prompt for best results...', 'warning');
                
                // Translate the prompt
                const translatedPrompt = await translateToEnglish(prompt);
                
                // Update the prompt input with the translated text (but don't show it to the user)
                const originalPrompt = promptInput.value; // Save original
                promptInput.value = translatedPrompt;
                
                // Proceed with image generation
                await originalGenerateImage();
                
                // Restore the original prompt (so user sees what they typed)
                promptInput.value = originalPrompt;
            } catch (error) {
                console.error('Translation failed:', error);
                // Proceed with original prompt if translation fails
                await originalGenerateImage();
            }
        } else {
            // If it's already English, proceed normally
            await originalGenerateImage();
        }
    };
});
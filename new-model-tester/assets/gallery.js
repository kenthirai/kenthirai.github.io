// gallery.js - Responsive 4-column image gallery for AI prompts
document.addEventListener('DOMContentLoaded', function() {
    // Create gallery container
    const galleryContainer = document.createElement('div');
    galleryContainer.className = 'prompt-gallery';
    
    // Insert gallery above the textarea
    const textarea = document.getElementById('prompt');
    textarea.parentNode.insertBefore(galleryContainer, textarea);

    // Sample prompts (can be expanded)
    const samplePrompts = [
        "spiderman flying around in cityscape at night with neon lights",
        "hulk on forest with glowing plants and fairies",
        "Cute robot playing with kittens in a meadow",
        "Superman flying with dolphins",
        "Steampunk airship flying through clouds",
        "Floating islands in a sunset sky",
        "ironman perched on a skyscraper",
        "panda and kangaroo landscape with strange plants"
    ];

    // Shuffle prompts and pick first 4
    const shuffledPrompts = [...samplePrompts]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    // Create 4 image items
    shuffledPrompts.forEach(prompt => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.alt = prompt;
        img.loading = 'lazy';
        img.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=200&height=200&model=flux&enhance=true&nologo=true`;
        
        // Click to insert prompt
        item.addEventListener('click', () => {
            textarea.value = prompt;
            item.classList.add('clicked');
            setTimeout(() => item.classList.remove('clicked'), 300);
        });
        
        item.appendChild(img);
        galleryContainer.appendChild(item);
    });

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .prompt-gallery {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
            width: 100%;
        }
        
        .gallery-item {
            aspect-ratio: 1/1;
            border-radius: 8px;
            border: dashed 1px #000;
            padding: 5px; 
            overflow: hidden;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f0f0f0;
        }
        
        .gallery-item:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .gallery-item.clicked {
            transform: scale(0.95);
            box-shadow: 0 0 0 3px #6c5ce7;
        }
        
        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 600px) {
            .prompt-gallery {
                gap: 6px;
            }
        }
        
        @media (max-width: 400px) {
            .prompt-gallery {
                gap: 4px;
            }
        }
    `;
    document.head.appendChild(style);
});
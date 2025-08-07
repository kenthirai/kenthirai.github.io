// history.js
document.addEventListener('DOMContentLoaded', function() {
    const historyBtn = document.getElementById('historyBtn');
    
    // Initialize history state
    const state = {
        generationHistory: JSON.parse(localStorage.getItem('aiImageGeneratorHistory') || '[]')
    };

    // Create modal if it doesn't exist
    createHistoryModal();

    // Add to history with image data URL conversion
    function addToHistory(prompt, imageUrl, params) {
        // Convert image to data URL if it's not already one
        const processImage = (url) => {
            return new Promise((resolve) => {
                if (url.startsWith('data:')) {
                    resolve(url); // Already a data URL
                    return;
                }
                
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas dimensions (reduce size for thumbnail)
                    const maxWidth = 400;
                    const maxHeight = 300;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }
                    
                    if (height > maxHeight) {
                        width = (maxHeight / height) * width;
                        height = maxHeight;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw image and convert to data URL
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality for compression
                    resolve(dataUrl);
                };
                
                img.onerror = function() {
                    // Fallback to original URL if conversion fails
                    resolve(url);
                };
                
                img.src = url;
            });
        };

        // Process the image and then add to history
        processImage(imageUrl).then((processedImageUrl) => {
            const historyItem = {
                prompt,
                imageUrl: processedImageUrl, // Use the processed URL (data URL if conversion succeeded)
                params,
                timestamp: new Date().toISOString()
            };
            
            state.generationHistory.unshift(historyItem);
            
            // Keep only last 10 items
            if (state.generationHistory.length > 10) {
                state.generationHistory.pop();
            }
            
            // Save to localStorage
            localStorage.setItem('aiImageGeneratorHistory', JSON.stringify(state.generationHistory));
        });
    }

    // Create history modal with neumorphism style
    function createHistoryModal() {
        const modal = document.createElement('div');
        modal.id = 'historyModal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '1000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        modal.style.overflow = 'auto';
        
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'var(--card-bg)';
        modalContent.style.margin = '5% auto';
        modalContent.style.padding = '2rem';
        modalContent.style.borderRadius = '20px';
        modalContent.style.maxWidth = '800px';
        modalContent.style.boxShadow = 
            '8px 8px 15px var(--shadow-dark), -8px -8px 15px var(--shadow-light)';
        modalContent.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '2rem';
        closeBtn.style.top = '1rem';
        closeBtn.style.fontSize = '2rem';
        closeBtn.style.color = 'var(--text-light)';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.transition = 'all 0.3s ease';
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = 'var(--primary)';
            closeBtn.style.transform = 'scale(1.1)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = 'var(--text-light)';
            closeBtn.style.transform = 'scale(1)';
        });
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        const title = document.createElement('h2');
        title.textContent = 'Generation History';
        title.style.color = 'var(--primary)';
        title.style.marginBottom = '1.5rem';
        title.style.textAlign = 'center';
        title.style.textShadow = 
            '2px 2px 3px var(--shadow-dark), -2px -2px 3px var(--shadow-light)';
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Show history with neumorphic cards
    function showHistory() {
        const modal = document.getElementById('historyModal');
        const modalContent = modal.querySelector('div');
        
        // Clear previous content (except close button and title)
        while (modalContent.children.length > 2) {
            modalContent.removeChild(modalContent.lastChild);
        }
        
        if (state.generationHistory.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'No generation history yet.';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = 'var(--text-light)';
            modalContent.appendChild(emptyMessage);
        } else {
            const historyList = document.createElement('div');
            historyList.style.display = 'grid';
            historyList.style.gap = '1.5rem';
            
            state.generationHistory.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.style.backgroundColor = 'var(--card-bg)';
                historyItem.style.borderRadius = '12px';
                historyItem.style.padding = '1.5rem';
                historyItem.style.boxShadow = 
                    '5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light)';
                historyItem.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                historyItem.style.transition = 'all 0.3s ease';
                
                historyItem.addEventListener('mouseenter', () => {
                    historyItem.style.transform = 'translateY(-5px)';
                    historyItem.style.boxShadow = 
                        '8px 8px 15px var(--shadow-dark), -8px -8px 15px var(--shadow-light)';
                });
                
                historyItem.addEventListener('mouseleave', () => {
                    historyItem.style.transform = 'translateY(0)';
                    historyItem.style.boxShadow = 
                        '5px 5px 10px var(--shadow-dark), -5px -5px 10px var(--shadow-light)';
                });
                
                const itemHeader = document.createElement('div');
                itemHeader.style.display = 'flex';
                itemHeader.style.justifyContent = 'space-between';
                itemHeader.style.marginBottom = '0.75rem';
                
                const itemNumber = document.createElement('span');
                itemNumber.textContent = `${index + 1}. ${item.prompt.substring(0, 50)}${item.prompt.length > 50 ? '...' : ''}`;
                itemNumber.style.fontWeight = '500';
                itemNumber.style.color = 'var(--text)';
                
                const itemDate = document.createElement('span');
                itemDate.textContent = new Date(item.timestamp).toLocaleString();
                itemDate.style.color = 'var(--text-light)';
                itemDate.style.fontSize = '0.85rem';
                
                itemHeader.appendChild(itemNumber);
                itemHeader.appendChild(itemDate);
                
                const imageContainer = document.createElement('div');
                imageContainer.style.marginTop = '0.75rem';
                imageContainer.style.display = 'flex';
                imageContainer.style.justifyContent = 'center';
                
                const thumbnail = document.createElement('img');
                thumbnail.src = item.imageUrl;
                thumbnail.style.maxWidth = '100%';
                thumbnail.style.maxHeight = '200px';
                thumbnail.style.borderRadius = '8px';
                thumbnail.style.cursor = 'pointer';
                thumbnail.style.boxShadow = 
                    '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)';
                thumbnail.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                thumbnail.addEventListener('click', () => {
                    showFullImage(item.imageUrl, item.prompt);
                });
                
                // Handle potential image loading errors
                thumbnail.onerror = function() {
                    // If the image fails to load (e.g., data URL is corrupted), show a placeholder
                    thumbnail.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+';
                    thumbnail.alt = 'Failed to load image';
                };
                
                imageContainer.appendChild(thumbnail);
                
                const paramsText = document.createElement('div');
                paramsText.style.marginTop = '0.75rem';
                paramsText.style.fontSize = '0.85rem';
                paramsText.style.color = 'var(--text-light)';
                
                let paramsString = '';
                if (item.params.width) paramsString += `Width: ${item.params.width}px, `;
                if (item.params.height) paramsString += `Height: ${item.params.height}px, `;
                if (item.params.model) paramsString += `Model: ${item.params.model}, `;
                if (item.params.seed) paramsString += `Seed: ${item.params.seed}`;
                
                paramsText.textContent = paramsString.replace(/, $/, '');
                
                const actionButtons = document.createElement('div');
                actionButtons.style.display = 'flex';
                actionButtons.style.gap = '0.75rem';
                actionButtons.style.marginTop = '1rem';
                
                const downloadBtn = document.createElement('button');
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
                downloadBtn.className = 'history-action-btn';
                downloadBtn.style.flex = '1';
                downloadBtn.style.padding = '0.75rem';
                downloadBtn.style.border = 'none';
                downloadBtn.style.borderRadius = '8px';
                downloadBtn.style.background = 'var(--primary)';
                downloadBtn.style.color = 'white';
                downloadBtn.style.cursor = 'pointer';
                downloadBtn.style.transition = 'all 0.3s ease';
                downloadBtn.style.boxShadow = 
                    '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)';
                
                downloadBtn.addEventListener('mouseenter', () => {
                    downloadBtn.style.background = 'var(--primary-dark)';
                    downloadBtn.style.transform = 'translateY(-2px)';
                });
                
                downloadBtn.addEventListener('mouseleave', () => {
                    downloadBtn.style.background = 'var(--primary)';
                    downloadBtn.style.transform = 'translateY(0)';
                });
                
                downloadBtn.addEventListener('click', () => {
                    downloadImage(item.imageUrl, `ai-image-${index}.png`);
                });
                
                const copyPromptBtn = document.createElement('button');
                copyPromptBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Prompt';
                copyPromptBtn.className = 'history-action-btn';
                copyPromptBtn.style.flex = '1';
                copyPromptBtn.style.padding = '0.75rem';
                copyPromptBtn.style.border = 'none';
                copyPromptBtn.style.borderRadius = '8px';
                copyPromptBtn.style.background = 'var(--card-bg)';
                copyPromptBtn.style.color = 'var(--text)';
                copyPromptBtn.style.cursor = 'pointer';
                copyPromptBtn.style.transition = 'all 0.3s ease';
                copyPromptBtn.style.boxShadow = 
                    '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)';

                copyPromptBtn.addEventListener('mouseenter', () => {
                    copyPromptBtn.style.background = 'rgba(108, 92, 231, 0.1)';
                    copyPromptBtn.style.transform = 'translateY(-2px)';
                    copyPromptBtn.style.boxShadow = 
                        '4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)';
                });

                copyPromptBtn.addEventListener('mouseleave', () => {
                    copyPromptBtn.style.background = 'var(--card-bg)';
                    copyPromptBtn.style.transform = 'translateY(0)';
                    copyPromptBtn.style.boxShadow = 
                        '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)';
                });

                copyPromptBtn.addEventListener('click', () => {
                    const tempInput = document.createElement('textarea');
                    tempInput.value = item.prompt;
                    tempInput.style.position = 'fixed';
                    tempInput.style.opacity = '0';
                    document.body.appendChild(tempInput);
                    
                    tempInput.select();
                    tempInput.setSelectionRange(0, 99999);
                    
                    try {
                        const successful = document.execCommand('copy');
                        if (!successful) throw new Error('Copy failed');
                        
                        copyPromptBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        copyPromptBtn.style.background = 'var(--success)';
                        copyPromptBtn.style.color = 'white';
                        copyPromptBtn.style.boxShadow = 'none';
                        
                        document.body.removeChild(tempInput);
                    } catch (err) {
                        console.error('Copy failed:', err);
                        
                        copyPromptBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
                        copyPromptBtn.style.background = 'var(--error)';
                        copyPromptBtn.style.color = 'white';
                        copyPromptBtn.style.boxShadow = 'none';
                        
                        document.body.removeChild(tempInput);
                    }
                    
                    setTimeout(() => {
                        copyPromptBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Prompt';
                        copyPromptBtn.style.background = 'var(--card-bg)';
                        copyPromptBtn.style.color = 'var(--text)';
                        copyPromptBtn.style.boxShadow = 
                            '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)';
                    }, 2000);
                });
                
                actionButtons.appendChild(downloadBtn);
                actionButtons.appendChild(copyPromptBtn);
                
                historyItem.appendChild(itemHeader);
                historyItem.appendChild(imageContainer);
                historyItem.appendChild(paramsText);
                historyItem.appendChild(actionButtons);
                historyList.appendChild(historyItem);
            });
            
            modalContent.appendChild(historyList);
        }
        
        modal.style.display = 'block';
    }

    // Show full image in modal with neumorphism style
    function showFullImage(imageUrl, prompt) {
        const imageModal = document.createElement('div');
        imageModal.style.position = 'fixed';
        imageModal.style.zIndex = '1001';
        imageModal.style.left = '0';
        imageModal.style.top = '0';
        imageModal.style.width = '100%';
        imageModal.style.height = '100%';
        imageModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        imageModal.style.display = 'flex';
        imageModal.style.flexDirection = 'column';
        imageModal.style.alignItems = 'center';
        imageModal.style.justifyContent = 'center';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.right = '2rem';
        closeBtn.style.top = '1rem';
        closeBtn.style.fontSize = '2rem';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.transition = 'all 0.3s ease';
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.transform = 'scale(1.2)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.transform = 'scale(1)';
        });
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(imageModal);
        });
        
        const promptText = document.createElement('p');
        promptText.textContent = prompt;
        promptText.style.color = 'white';
        promptText.style.marginBottom = '1.5rem';
        promptText.style.maxWidth = '80%';
        promptText.style.textAlign = 'center';
        promptText.style.fontSize = '1.1rem';
        promptText.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.5)';
        
        const fullImage = document.createElement('img');
        fullImage.src = imageUrl;
        fullImage.style.maxWidth = '90%';
        fullImage.style.maxHeight = '70vh';
        fullImage.style.borderRadius = '12px';
        fullImage.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        
        // Handle potential image loading errors
        fullImage.onerror = function() {
            fullImage.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NjYyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+';
            fullImage.alt = 'Failed to load image';
        };
        
        const downloadBtn = document.createElement('button');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        downloadBtn.style.marginTop = '1.5rem';
        downloadBtn.style.padding = '0.75rem 1.5rem';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '8px';
        downloadBtn.style.background = 'var(--primary)';
        downloadBtn.style.color = 'white';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.transition = 'all 0.3s ease';
        downloadBtn.style.fontSize = '1rem';
        downloadBtn.style.boxShadow = 
            '3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)';
        
        downloadBtn.addEventListener('mouseenter', () => {
            downloadBtn.style.background = 'var(--primary-dark)';
            downloadBtn.style.transform = 'translateY(-2px)';
        });
        
        downloadBtn.addEventListener('mouseleave', () => {
            downloadBtn.style.background = 'var(--primary)';
            downloadBtn.style.transform = 'translateY(0)';
        });
        
        downloadBtn.addEventListener('click', () => {
            downloadImage(imageUrl, `ai-image-${Date.now()}.png`);
        });
        
        imageModal.appendChild(closeBtn);
        imageModal.appendChild(promptText);
        imageModal.appendChild(fullImage);
        imageModal.appendChild(downloadBtn);
        document.body.appendChild(imageModal);
        
        // Close modal when clicking outside
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                document.body.removeChild(imageModal);
            }
        });
    }

    // Download image helper
    function downloadImage(url, filename) {
        // Handle data URLs differently
        if (url.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // For regular URLs, use fetch to ensure the image is downloadable
            fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                })
                .catch(err => {
                    console.error('Download failed:', err);
                    alert('Failed to download image. Please try again.');
                });
        }
    }

    // Initialize history button
    historyBtn.addEventListener('click', showHistory);

    // Expose addToHistory function to global scope
    window.addToHistory = addToHistory;
});
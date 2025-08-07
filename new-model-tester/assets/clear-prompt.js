// clear-prompt.js
document.addEventListener('DOMContentLoaded', function() {
    const clearPromptBtn = document.getElementById('clearPromptBtn');
    const promptInput = document.getElementById('prompt');
    const textareaWrapper = document.querySelector('.textarea-wrapper');
    
    // Show/hide button based on content
    function toggleClearButton() {
        clearPromptBtn.style.display = promptInput.value.trim() ? 'flex' : 'none';
    }
    
    // Clear textarea
    clearPromptBtn.addEventListener('click', function(e) {
        e.preventDefault();
        promptInput.value = '';
        promptInput.focus();
        toggleClearButton();
        
        // Add visual feedback
        const icon = this.querySelector('i');
        icon.className = 'fas fa-check';
        setTimeout(() => {
            icon.className = 'fas fa-times';
        }, 1000);
    });
    
    // Initialize and update on input
    promptInput.addEventListener('input', toggleClearButton);
    toggleClearButton();
    
    // Also clear when pressing Escape if focused
    promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && this.value !== '') {
            clearPromptBtn.click();
        }
    });
});
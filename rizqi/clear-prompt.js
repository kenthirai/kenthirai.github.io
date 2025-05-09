document.addEventListener('DOMContentLoaded', function() {
    const clearPromptBtn = document.getElementById('clear-prompt');
    const promptInput = document.getElementById('prompt');
    
    clearPromptBtn.addEventListener('click', function() {
        promptInput.value = '';
        promptInput.focus();
    });
});
document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('prompt');
    
    if (promptInput) {
        // Function to make the textarea blink
        function blinkTextarea(times, interval) {
            let count = 0;
            const blinkInterval = setInterval(() => {
                promptInput.style.borderColor = (promptInput.style.borderColor === 'transparent') 
                    ? '#6c5ce7' 
                    : 'transparent';
                count++;
                
                if (count >= times * 2) {
                    clearInterval(blinkInterval);
                    promptInput.style.borderColor = ''; // Reset to default
                }
            }, interval);
        }

        // Start blinking after a short delay (1 second)
        setTimeout(() => {
            blinkTextarea(30 300); // Blink 10 times with 200ms interval
        }, 1000);
    }
});

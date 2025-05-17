 // Elemen DOM
        const elements = {
            sourceText: document.getElementById('sourceText'),
            targetText: document.getElementById('targetText'),
            translateBtn: document.getElementById('translateBtn'),
            copySourceBtn: document.getElementById('copySource'),
            copyTargetBtn: document.getElementById('copyTarget'),
            clearSourceBtn: document.getElementById('clearSource'),
            clearTargetBtn: document.getElementById('clearTarget'),
            toggleDirectionBtn: document.getElementById('toggleDirection'),
            sourceLabel: document.getElementById('sourceLabel'),
            targetLabel: document.getElementById('targetLabel'),
            loadingIndicator: document.getElementById('loadingIndicator'),
            sourceCharCount: document.getElementById('sourceCharCount'),
            targetCharCount: document.getElementById('targetCharCount')
        };

        let translationDirection = true;

        function updateCharCount() {
            elements.sourceCharCount.textContent = `${elements.sourceText.value.length} karakter`;
            elements.targetCharCount.textContent = `${elements.targetText.value.length} karakter`;
        }

        function toggleDirection() {
            translationDirection = !translationDirection;
            
            if (translationDirection) {
                elements.sourceLabel.textContent = 'Tulisan Pegon';
                elements.targetLabel.textContent = 'Terjemahan Indonesia';
                elements.sourceText.placeholder = 'Masukkan teks Pegon di sini...';
            } else {
                elements.sourceLabel.textContent = 'Tulisan Indonesia';
                elements.targetLabel.textContent = 'Terjemahan Pegon';
                elements.sourceText.placeholder = 'Masukkan teks Indonesia di sini...';
            }
            
            elements.targetText.value = '';
            updateCharCount();
            
            Swal.fire({
                icon: 'success',
                title: 'Arah Terjemahan Diubah',
                text: `Sekarang menerjemahkan dari ${elements.sourceLabel.textContent} ke ${elements.targetLabel.textContent}`,
                timer: 1500,
                showConfirmButton: false
            });
        }

        async function copyText(textArea, label) {
            try {
                if (!navigator.clipboard) {
                    return fallbackCopyText(textArea, label);
                }
                
                await navigator.clipboard.writeText(textArea.value);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Teks Disalin!',
                    text: `Teks dari ${label} berhasil disalin`,
                    timer: 1000,
                    showConfirmButton: false
                });
            } catch (err) {
                fallbackCopyText(textArea, label);
            }
        }

        function fallbackCopyText(textArea, label) {
            try {
                textArea.select();
                textArea.setSelectionRange(0, 99999);
                
                const successful = document.execCommand('copy');
                
                if (successful) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Teks Disalin!',
                        text: `Teks dari ${label} berhasil disalin`,
                        timer: 1000,
                        showConfirmButton: false
                    });
                } else {
                    throw new Error('Fallback copy failed');
                }
            } catch (err) {
                Swal.fire({
                    icon: 'info',
                    title: 'Salin Manual',
                    html: `Tekan <kbd>Ctrl+C</kbd> untuk menyalin:<br>
                          <textarea style="width:100%; height:100px; margin-top:10px;">${textArea.value}</textarea>`,
                    confirmButtonText: 'Mengerti'
                });
            }
        }

        async function translateText() {
            const text = elements.sourceText.value.trim();
            if (!text) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Teks Kosong',
                    text: 'Masukkan teks yang akan diterjemahkan!'
                });
                return;
            }

            elements.loadingIndicator.style.display = 'block';
            elements.targetText.value = '';

            try {
                const instruction = translationDirection 
                    ? "Terjemahkan teks Jawi berikut ke Bahasa Indonesia: " 
                    : "Terjemahkan teks apapaun termasuk Indonesia berikut ke tulisan Jawi: ";

                const result = await postChatCompletion([
                    { role: "system", content: "Anda adalah penerjemah ahli Jawi-Indonesia." },
                    { role: "user", content: instruction + text }
                ], { model: "gpt-3.5-turbo" });
                
                if (result?.choices?.[0]?.message?.content) {
                    elements.targetText.value = result.choices[0].message.content;
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        timer: 1000,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Terjadi kesalahan saat menerjemahkan'
                });
                elements.targetText.value = 'Error: Gagal menerjemahkan';
            } finally {
                elements.loadingIndicator.style.display = 'none';
                updateCharCount();
            }
        }

        async function postChatCompletion(messages, options = {}) {
            const response = await fetch("https://text.pollinations.ai/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: options.model || "openai",
                    messages,
                    referrer: "WebApp"
                })
            });
            return await response.json();
        }

        // Event listeners
        elements.translateBtn.addEventListener('click', translateText);
        elements.copySourceBtn.addEventListener('click', () => copyText(elements.sourceText, elements.sourceLabel.textContent));
        elements.copyTargetBtn.addEventListener('click', () => copyText(elements.targetText, elements.targetLabel.textContent));
        elements.clearSourceBtn.addEventListener('click', () => {
            elements.sourceText.value = '';
            updateCharCount();
        });
        elements.clearTargetBtn.addEventListener('click', () => {
            elements.targetText.value = '';
            updateCharCount();
        });
        elements.toggleDirectionBtn.addEventListener('click', toggleDirection);
        elements.sourceText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') translateText();
        });
        elements.sourceText.addEventListener('input', updateCharCount);
        elements.targetText.addEventListener('input', updateCharCount);

        // Inisialisasi
        updateCharCount();
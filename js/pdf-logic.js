// Variables globales de estado
let selectedFile = null;
const { PDFDocument } = PDFLib;

// Escuchamos cuando el usuario sube un archivo
document.getElementById('pdf-input').addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        document.getElementById('controls').classList.remove('hidden');
        updateStatus(`Archivo listo: ${selectedFile.name}`, 'blue');
    }
});

// Función profesional para dividir el PDF
async function splitPDF() {
    if (!selectedFile) return;
    
    updateStatus('Procesando...', 'orange');
    const zip = new JSZip();
    
    try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const mainDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = mainDoc.getPageCount();

        // Lógica de extracción (resumida para el ejemplo)
        for (let i = 0; i < totalPages; i++) {
            const newDoc = await PDFDocument.create();
            const [copiedPage] = await newDoc.copyPages(mainDoc, [i]);
            newDoc.addPage(copiedPage);
            
            const pdfBytes = await newDoc.save();
            zip.file(`pagina_${i + 1}.pdf`, pdfBytes);
        }

        const zipContent = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipContent, "documentos_divididos.zip");
        updateStatus('✅ ¡Listo!', 'green');

    } catch (error) {
        console.error(error);
        updateStatus('❌ Error al procesar', 'red');
    }
}

function updateStatus(msg, color) {
    const s = document.getElementById('status-msg');
    s.innerText = msg;
    s.style.color = color;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}

// Conectamos el botón de ejecución
document.getElementById('exec-btn').onclick = splitPDF;
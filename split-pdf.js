// ======================================
// ELEMENTS
// ======================================

const dropArea = document.getElementById("dropArea");
const selectBtn = document.getElementById("selectBtn");
const pdfInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");
const previewTitle = document.getElementById("previewTitle");
const convertBtn = document.getElementById("convertBtn");

// ======================================
// STORAGE
// ======================================

let pdfFile = null;

// ======================================
// INITIALIZE
// ======================================

updateTitle();

// ======================================
// OPEN FILE PICKER
// ======================================

selectBtn.addEventListener("click", () => {

    pdfInput.click();

});

// ======================================
// FILE SELECT
// ======================================

pdfInput.addEventListener("change", () => {

    if(pdfInput.files.length){

        loadPDF(pdfInput.files[0]);

    }

    pdfInput.value = "";

});

// ======================================
// DRAG & DROP
// ======================================

["dragenter","dragover","dragleave","drop"].forEach(event=>{

    dropArea.addEventListener(event,(e)=>{

        e.preventDefault();

        e.stopPropagation();

    });

});

["dragenter","dragover"].forEach(event=>{

    dropArea.addEventListener(event,()=>{

        dropArea.classList.add("dragover");

    });

});

["dragleave","drop"].forEach(event=>{

    dropArea.addEventListener(event,()=>{

        dropArea.classList.remove("dragover");

    });

});

dropArea.addEventListener("drop",(e)=>{

    if(e.dataTransfer.files.length){

        loadPDF(e.dataTransfer.files[0]);

    }

});

// ======================================
// UPDATE TITLE
// ======================================

function updateTitle(){

    if(pdfFile){

        previewTitle.textContent = "Selected PDF";

    }else{

        previewTitle.textContent = "No PDF Selected";

    }

}

// ======================================
// LOAD PDF
// ======================================

function loadPDF(file){

    if(file.type !== "application/pdf"){

        alert("Please upload a PDF file.");

        return;

    }

    pdfFile = file;

    updateTitle();

    previewContainer.innerHTML = "";

    const card = document.createElement("div");

    card.className = "image-card";

    card.innerHTML = `

        <button class="remove-btn">&times;</button>

        <i class="fa-solid fa-file-pdf"
        style="font-size:80px;color:#DC2626;padding:35px;"></i>

        <p>${file.name}</p>

    `;

    previewContainer.appendChild(card);
        card.querySelector(".remove-btn").addEventListener("click",()=>{

        pdfFile = null;

        previewContainer.innerHTML = "";

        updateTitle();

    });

}

// ======================================
// SPLIT PDF
// ======================================

convertBtn.addEventListener("click", async () => {

    if(!pdfFile){

        alert("Please upload a PDF.");

        return;

    }

    convertBtn.disabled = true;

    convertBtn.textContent = "Splitting...";

    try{

        const pdfBytes = await pdfFile.arrayBuffer();

        const sourcePdf = await PDFLib.PDFDocument.load(pdfBytes);

        const totalPages = sourcePdf.getPageCount();

        const zip = new JSZip();

        const baseName = pdfFile.name.replace(/\.pdf$/i,"");

        for(let i = 0; i < totalPages; i++){

            const newPdf = await PDFLib.PDFDocument.create();

            const [page] = await newPdf.copyPages(sourcePdf,[i]);

            newPdf.addPage(page);
                        const singlePdfBytes = await newPdf.save();

            zip.file(

                `${baseName}_Page_${i + 1}.pdf`,

                singlePdfBytes

            );

        }

        const zipBlob = await zip.generateAsync({

            type: "blob"

        });

        const link = document.createElement("a");

        link.href = URL.createObjectURL(zipBlob);

        link.download = `${baseName}_Split.zip`;

        link.click();

        URL.revokeObjectURL(link.href);
    }

    catch(error){

        console.error(error);

        alert("Something went wrong while splitting the PDF.");

    }

    finally{

        convertBtn.disabled = false;

        convertBtn.textContent = "Split PDF";

    }

});
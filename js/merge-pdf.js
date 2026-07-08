// ======================================
// ELEMENTS
// ======================================

const dropArea = document.getElementById("dropArea");
const selectBtn = document.getElementById("selectBtn");
const pdfInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");
const convertBtn = document.getElementById("convertBtn");
const previewTitle = document.getElementById("previewTitle");

// ======================================
// STORAGE
// ======================================

let pdfFiles = [];

// ======================================
// INITIAL STATE
// ======================================

if (convertBtn) {

    convertBtn.disabled = true;

}

updateCount();

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

    addFiles(pdfInput.files);

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

    addFiles(e.dataTransfer.files);

});

// ======================================
// UPDATE COUNT
// ======================================

function updateCount(){

    if(previewTitle){

        previewTitle.textContent = `Selected PDFs (${pdfFiles.length})`;

    }

    if(convertBtn){

        convertBtn.disabled = pdfFiles.length < 2;

    }

}

// ======================================
// ADD FILES
// ======================================

function addFiles(files){

    [...files].forEach(file=>{

        if(file.type !== "application/pdf") return;

        if(pdfFiles.some(f=>f.name===file.name && f.size===file.size)) return;

        pdfFiles.push(file);

        createPDFCard(file);

    });

    updateCount();

}

// ======================================
// CREATE PDF CARD
// ======================================

function createPDFCard(file){

    const card = document.createElement("div");

    card.className = "image-card";

    card.dataset.name = file.name;

    card.innerHTML = `

        <button class="remove-btn">&times;</button>

        <i class="fa-solid fa-file-pdf"
        style="font-size:80px;color:#DC2626;padding:35px;"></i>

        <p>${file.name}</p>

    `;

    previewContainer.appendChild(card);

    card.querySelector(".remove-btn").addEventListener("click",()=>{

        pdfFiles = pdfFiles.filter(f=>f!==file);

        card.remove();

        updateCount();

    });

}

// ======================================
// SORTABLE
// ======================================

new Sortable(previewContainer,{

    animation:250,

    ghostClass:"dragging",

    chosenClass:"chosen",

    onEnd(){

        const newOrder=[];

        document.querySelectorAll(".image-card").forEach(card=>{

            const file=pdfFiles.find(f=>f.name===card.dataset.name);

            if(file){

                newOrder.push(file);

            }

        });

        pdfFiles=newOrder;

    }

});

// ======================================
// MERGE PDF
// ======================================

convertBtn.addEventListener("click",async()=>{

    if(pdfFiles.length<2){

        alert("Please select at least 2 PDF files.");

        return;

    }

    convertBtn.disabled=true;

    convertBtn.textContent="Merging...";

    try{

        const mergedPdf=await PDFLib.PDFDocument.create();

        for(const file of pdfFiles){

            const bytes=await file.arrayBuffer();

            const pdf=await PDFLib.PDFDocument.load(bytes);

            const pages=await mergedPdf.copyPages(

                pdf,

                pdf.getPageIndices()

            );

            pages.forEach(page=>mergedPdf.addPage(page));

        }

                const mergedBytes = await mergedPdf.save();

        const blob = new Blob([mergedBytes],{

            type:"application/pdf"

        });

        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);

        const firstFile = pdfFiles[0].name.replace(/\.pdf$/i,"");

        link.download = `${firstFile}_Merged.pdf`;

        link.click();

        URL.revokeObjectURL(link.href);

    }

    catch(error){

        console.error(error);

        alert("Something went wrong while merging the PDFs.");

    }

    finally{

        convertBtn.textContent="Merge PDF";

        updateCount();

    }

});
// ======================================
// ELEMENTS
// ======================================

const dropArea = document.getElementById("dropArea");
const selectBtn = document.getElementById("selectBtn");
const pdfInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");
const convertBtn = document.getElementById("convertBtn");
const downloadZipBtn = document.getElementById("downloadZipBtn");

// ======================================
// STORAGE
// ======================================

let pdfFile = null;
let convertedImages = [];

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

});

// ======================================
// DRAG & DROP
// ======================================

["dragenter","dragover","dragleave","drop"].forEach(event=>{

    dropArea.addEventListener(event,e=>{

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

dropArea.addEventListener("drop",e=>{

    if(e.dataTransfer.files.length){

        loadPDF(e.dataTransfer.files[0]);

    }

});

// ======================================
// LOAD PDF
// ======================================

function loadPDF(file){

    if(file.type !== "application/pdf"){

        alert("Please select a PDF file.");

        return;

    }

    pdfFile = file;

    previewContainer.innerHTML = "";

    const card = document.createElement("div");

    card.className = "image-card";

    card.innerHTML = `

        <i class="fa-solid fa-file-pdf" style="font-size:90px;color:#E11D48;padding:40px;"></i>

        <p>${file.name}</p>

    `;

    previewContainer.appendChild(card);

}

// ======================================
// CONVERT PDF TO JPG
// ======================================

convertBtn.addEventListener("click", async () => {

    if (!pdfFile) {

        alert("Please upload a PDF.");

        return;

    }

    const fileReader = new FileReader();

    fileReader.onload = async function () {

        const typedArray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

        previewContainer.innerHTML = "";

        convertedImages = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

            const page = await pdf.getPage(pageNumber);

            const viewport = page.getViewport({ scale: 2 });

            const canvas = document.createElement("canvas");

            const context = canvas.getContext("2d");

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({

                canvasContext: context,
                viewport: viewport

            }).promise;

            const imageURL = canvas.toDataURL("image/jpeg", 1);

            createImageCard(imageURL, pageNumber);

        }

    };

    fileReader.readAsArrayBuffer(pdfFile);

});

// ======================================
// CREATE JPG CARD
// ======================================

function createImageCard(imageURL, pageNumber){

    const card = document.createElement("div");

    card.className = "image-card";

    card.innerHTML = `

        <img src="${imageURL}">

        <p>Page ${pageNumber}</p>

        <button class="download-btn">

            Download JPG

        </button>

    `;

    convertedImages.push({

    page: pageNumber,

    image: imageURL

});

downloadZipBtn.style.display = "inline-block";

    previewContainer.appendChild(card);

    card.querySelector(".download-btn").addEventListener("click", () => {

        const link = document.createElement("a");

        link.href = imageURL;

        link.download = `Page-${pageNumber}.jpg`;

        link.click();

    });

}

// ======================================
// DOWNLOAD ALL AS ZIP
// ======================================

downloadZipBtn.addEventListener("click", async () => {

    if (convertedImages.length === 0) {

        alert("Please convert a PDF first.");

        return;

    }

    const zip = new JSZip();

    for (const item of convertedImages) {

        const response = await fetch(item.image);

        const blob = await response.blob();

        zip.file(`Page-${item.page}.jpg`, blob);

    }

    const zipBlob = await zip.generateAsync({

        type: "blob"

    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(zipBlob);

    const fileName = pdfFile.name.replace(/\.pdf$/i, "");

link.download = `${fileName}.zip`;

    link.click();

    URL.revokeObjectURL(link.href);

});
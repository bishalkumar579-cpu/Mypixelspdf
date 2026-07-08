// ======================================
// ELEMENTS
// ======================================

const resultBox = document.getElementById("resultBox");
const originalSize = document.getElementById("originalSize");
const compressedSize = document.getElementById("compressedSize");
const savedSize = document.getElementById("savedSize");
const downloadBtn = document.getElementById("downloadBtn");

const compressionMethod = document.getElementById("compressionMethod");
const percentageBox = document.getElementById("percentageBox");
const pixelBox = document.getElementById("pixelBox");

const dropArea = document.getElementById("dropArea");
const selectBtn = document.getElementById("selectBtn");
const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");
const convertBtn = document.getElementById("convertBtn");

// ======================================
// STORAGE
// ======================================

let images = [];
let compressedBlob = null;

// ======================================
// COMPRESSION METHOD
// ======================================

compressionMethod.addEventListener("change", () => {

    if (compressionMethod.value === "percentage") {

        percentageBox.style.display = "block";
        pixelBox.style.display = "none";

    } else {

        percentageBox.style.display = "none";
        pixelBox.style.display = "grid";

    }

});

// ======================================
// OPEN FILE PICKER
// ======================================

selectBtn.addEventListener("click", () => {

    imageInput.click();

});

// ======================================
// SELECT IMAGE
// ======================================

imageInput.addEventListener("change", () => {

    addFiles(imageInput.files);

});

// ======================================
// DRAG & DROP
// ======================================

["dragenter","dragover","dragleave","drop"].forEach(eventName=>{

    dropArea.addEventListener(eventName,(e)=>{

        e.preventDefault();
        e.stopPropagation();

    });

});

["dragenter","dragover"].forEach(eventName=>{

    dropArea.addEventListener(eventName,()=>{

        dropArea.classList.add("dragover");

    });

});

["dragleave","drop"].forEach(eventName=>{

    dropArea.addEventListener(eventName,()=>{

        dropArea.classList.remove("dragover");

    });

});

dropArea.addEventListener("drop",(e)=>{

    addFiles(e.dataTransfer.files);

});

// ======================================
// ADD IMAGE
// ======================================

function addFiles(files){

    const file = files[0];

    if(!file) return;

    if(!file.type.startsWith("image/")) return;

    images = [];
    compressedBlob = null;

    previewContainer.innerHTML = "";

    resultBox.style.display = "none";

    const reader = new FileReader();

    reader.onload = function(event){

        const imageData = {

            id: Date.now(),

            name: file.name,

            src: event.target.result,

            fileSize: file.size

        };

        images.push(imageData);

        createImageCard(imageData);

    };

    reader.readAsDataURL(file);

}

// ======================================
// CREATE IMAGE CARD
// ======================================

function createImageCard(imageData){

    const card = document.createElement("div");

    card.className = "image-card";

    card.innerHTML = `

        <button class="remove-btn">&times;</button>

        <img src="${imageData.src}">

        <p>${imageData.name}</p>

    `;

    previewContainer.appendChild(card);

    card.querySelector(".remove-btn").addEventListener("click",()=>{

        images = [];

        compressedBlob = null;

        previewContainer.innerHTML = "";

        imageInput.value = "";

        resultBox.style.display = "none";

    });

}

// ======================================
// COMPRESS BUTTON
// ======================================

convertBtn.addEventListener("click", () => {

    if (images.length === 0) {

        alert("Please upload an image.");

        return;

    }

    if (compressionMethod.value === "percentage") {

        const percentage = Number(document.getElementById("percentage").value);

        if (isNaN(percentage) || percentage < 1 || percentage > 99) {

            alert("Please enter a percentage between 1 and 99.");

            return;

        }

        compressImage(images[0], percentage);

    } else {

        compressImage(images[0], null);

    }

});

// ======================================
// COMPRESS IMAGE
// ======================================

function compressImage(imageData, percentage){

    const img = new Image();

    img.onload = () => {

        const canvas = document.createElement("canvas");

        const ctx = canvas.getContext("2d");

        let width = img.width;

        let height = img.height;

        // ==========================
        // Resize by Pixels
        // ==========================

        if(compressionMethod.value === "pixels"){

            const inputWidth = Number(document.getElementById("width").value);

            const inputHeight = Number(document.getElementById("height").value);

            if(

                isNaN(inputWidth) || inputWidth <= 0 ||

                isNaN(inputHeight) || inputHeight <= 0

            ){

                alert("Please enter valid Width and Height.");

                return;

            }

            width = inputWidth;

            height = inputHeight;

        }

        canvas.width = width;

        canvas.height = height;

        ctx.drawImage(img,0,0,width,height);

        let quality = 1;

        if(compressionMethod.value === "percentage"){

            quality = (100 - percentage) / 100;

        }

        canvas.toBlob((blob)=>{

            compressedBlob = blob;

            const beforeKB = (imageData.fileSize / 1024).toFixed(1);

            const afterKB = (blob.size / 1024).toFixed(1);

            const saved = (

                ((imageData.fileSize - blob.size) / imageData.fileSize) * 100

            ).toFixed(1);

            originalSize.textContent = `Original Size : ${beforeKB} KB`;

            compressedSize.textContent = `Compressed Size : ${afterKB} KB`;

            savedSize.textContent = `Saved : ${saved}%`;

            resultBox.style.display = "block";

        },"image/jpeg",quality);

    };

    img.src = imageData.src;

}

// ======================================
// DOWNLOAD IMAGE
// ======================================

downloadBtn.addEventListener("click", () => {

    if (!compressedBlob) {

        alert("Please compress an image first.");

        return;

    }

    const link = document.createElement("a");

    link.href = URL.createObjectURL(compressedBlob);

    const fileName = images[0].name.replace(/\.[^/.]+$/, "");

    link.download = `${fileName}-compressed.jpg`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);

});

// ======================================
// RESET RESULT WHEN SETTINGS CHANGE
// ======================================

document.getElementById("percentage").addEventListener("input", () => {

    resultBox.style.display = "none";

});

document.getElementById("width").addEventListener("input", () => {

    resultBox.style.display = "none";

});

document.getElementById("height").addEventListener("input", () => {

    resultBox.style.display = "none";

});

compressionMethod.addEventListener("change", () => {

    resultBox.style.display = "none";

});

// ======================================
// READY
// ======================================

console.log("Compress Image Tool Loaded");


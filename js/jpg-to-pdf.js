// ======================================
// ELEMENTS
// ======================================

const dropArea = document.getElementById("dropArea");
const selectBtn = document.getElementById("selectBtn");
const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");

const convertBtn = document.getElementById("convertBtn");
const pageSize = document.getElementById("pageSize");
const orientation = document.getElementById("orientation");

// ======================================
// IMAGE STORAGE
// ======================================

let images = [];

// ======================================
// OPEN FILE PICKER
// ======================================

selectBtn.addEventListener("click", () => {

    imageInput.click();

});

// ======================================
// SELECT IMAGES
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
// ADD FILES
// ======================================

function addFiles(files){

    [...files].forEach(file=>{

        if(!file.type.startsWith("image/")) return;

        const reader = new FileReader();

        reader.onload = function(event){

            const imageData={

                id:Date.now()+Math.random(),

                name:file.name,

                src:event.target.result

            };

            images.push(imageData);

            createImageCard(imageData);

        };

        reader.readAsDataURL(file);

    });

}

// ======================================
// CREATE IMAGE CARD
// ======================================

function createImageCard(imageData){

    const card = document.createElement("div");

    card.className = "image-card";

    card.dataset.id = imageData.id;

    card.innerHTML = `
        <button class="remove-btn">&times;</button>

        <img src="${imageData.src}" alt="${imageData.name}">

        <p>${imageData.name}</p>
    `;

    previewContainer.appendChild(card);

    // Remove Image

    card.querySelector(".remove-btn").addEventListener("click",()=>{

        images = images.filter(img=>img.id!==imageData.id);

        card.remove();

    });

}

// ======================================
// SORTABLE
// ======================================

new Sortable(previewContainer,{

    animation:250,

    ghostClass:"dragging",

    chosenClass:"chosen",

    dragClass:"drag",

    onEnd(){

        const newOrder=[];

        document.querySelectorAll(".image-card").forEach(card=>{

            const id=Number(card.dataset.id);

            const image=images.find(img=>img.id===id);

            if(image){

                newOrder.push(image);

            }

        });

        images=newOrder;

    }

});

// ======================================
// EXPORT
// ======================================

// Export for PDF Generator

window.getImages = () => images;

window.convertBtn = convertBtn;
window.pageSize = pageSize;
window.orientation = orientation;
// ======================================
// PDF GENERATOR
// ======================================

const { PDFDocument } = PDFLib;

convertBtn.addEventListener("click", async () => {

    const images = window.getImages();

    if (images.length === 0) {
        alert("Please select at least one image.");
        return;
    }

    convertBtn.disabled = true;
    convertBtn.textContent = "Generating PDF...";

    try {

        const pdfDoc = await PDFDocument.create();

        const size = pageSize.value;
        const orient = orientation.value;

        let PAGE_WIDTH;
        let PAGE_HEIGHT;

        if (size === "A4") {
            PAGE_WIDTH = 595.28;
            PAGE_HEIGHT = 841.89;
        } else {
            PAGE_WIDTH = 612;
            PAGE_HEIGHT = 792;
        }

        if (orient === "landscape") {
            [PAGE_WIDTH, PAGE_HEIGHT] = [PAGE_HEIGHT, PAGE_WIDTH];
        }

        for (const img of images) {

            const imageBytes = await fetch(img.src).then(res => res.arrayBuffer());

            let embeddedImage;

            if (img.src.startsWith("data:image/png")) {

                embeddedImage = await pdfDoc.embedPng(imageBytes);

            } else {

                embeddedImage = await pdfDoc.embedJpg(imageBytes);

            }

            const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

            const imgWidth = embeddedImage.width;
            const imgHeight = embeddedImage.height;

            const scale = Math.min(
                PAGE_WIDTH / imgWidth,
                PAGE_HEIGHT / imgHeight
            );

            const width = imgWidth * scale;
            const height = imgHeight * scale;

            const x = (PAGE_WIDTH - width) / 2;
            const y = (PAGE_HEIGHT - height) / 2;

            page.drawImage(embeddedImage, {

                x,
                y,
                width,
                height

            });

        }
                const pdfBytes = await pdfDoc.save();

        const blob = new Blob([pdfBytes], {
            type: "application/pdf"
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        const firstImageName = images[0].name.replace(/\.[^/.]+$/, "");

a.download = `${firstImageName}.pdf`;

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

    } catch (error) {

        console.error(error);

        alert("Failed to generate PDF.");

    }

    convertBtn.disabled = false;
    convertBtn.textContent = "Convert to PDF";

});
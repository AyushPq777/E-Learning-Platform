import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// In a real application, you would load custom fonts
// For this example, we'll use standard fonts

export const generateCertificate = async (enrollment) => {
    try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        // Add a blank page
        const page = pdfDoc.addPage([800, 600]);

        // Get standard fonts
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

        // Draw background (optional - you can add a certificate template image)
        // For now, we'll create a simple border
        page.drawRectangle({
            x: 20,
            y: 20,
            width: 760,
            height: 560,
            borderColor: rgb(0.1, 0.1, 0.1),
            borderWidth: 2,
        });

        // Add title
        page.drawText('CERTIFICATE OF COMPLETION', {
            x: 200,
            y: 500,
            size: 24,
            font: helveticaBold,
            color: rgb(0.1, 0.1, 0.1),
        });

        // Add subtitle
        page.drawText('This certifies that', {
            x: 320,
            y: 450,
            size: 14,
            font: helveticaFont,
            color: rgb(0.3, 0.3, 0.3),
        });

        // Add student name
        page.drawText(enrollment.student.name, {
            x: 250,
            y: 400,
            size: 28,
            font: helveticaBold,
            color: rgb(0, 0.4, 0.6),
        });

        // Add completion text
        page.drawText('has successfully completed the course', {
            x: 220,
            y: 350,
            size: 14,
            font: helveticaFont,
            color: rgb(0.3, 0.3, 0.3),
        });

        // Add course title
        page.drawText(`"${enrollment.course.title}"`, {
            x: 200,
            y: 310,
            size: 18,
            font: helveticaBold,
            color: rgb(0.1, 0.1, 0.1),
            maxWidth: 400,
        });

        // Add instructor information
        page.drawText(`Instructor: ${enrollment.course.instructor.name}`, {
            x: 300,
            y: 250,
            size: 12,
            font: helveticaFont,
            color: rgb(0.3, 0.3, 0.3),
        });

        // Add completion date
        const completionDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        page.drawText(`Completed on: ${completionDate}`, {
            x: 280,
            y: 220,
            size: 12,
            font: helveticaFont,
            color: rgb(0.3, 0.3, 0.3),
        });

        // Add certificate ID
        page.drawText(`Certificate ID: ${enrollment.certificateId}`, {
            x: 50,
            y: 50,
            size: 10,
            font: helveticaOblique,
            color: rgb(0.5, 0.5, 0.5),
        });

        // Add verification note
        page.drawText('Verify this certificate at: yourplatform.com/verify-certificate', {
            x: 200,
            y: 30,
            size: 10,
            font: helveticaOblique,
            color: rgb(0.5, 0.5, 0.5),
        });

        // Serialize the PDF to bytes
        const pdfBytes = await pdfDoc.save();

        return pdfBytes;
    } catch (error) {
        console.error('Certificate generation error:', error);
        throw new Error('Failed to generate certificate');
    }
};

// Alternative certificate template with more design
export const generatePremiumCertificate = async (enrollment) => {
    // This would be a more designed certificate with backgrounds, logos, etc.
    // You can load a certificate template image and add text on top of it

    const pdfDoc = await PDFDocument.create();

    // Here you would:
    // 1. Load a certificate template (PNG/JPEG)
    // 2. Embed the image in the PDF
    // 3. Add text on top of the image

    // For now, we'll return the simple version
    return generateCertificate(enrollment);
};
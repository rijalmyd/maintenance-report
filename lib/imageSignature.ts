import fs from 'fs';
import path from 'path';

export function getSignatureByUsername(username: string): string {
    if (!username) return '';

    // 1. Normalisasi nama (contoh: "Aditya Putra" -> "aditya-putra")
    const slugName = username.toLowerCase().trim().replace(/\s+/g, '-');
    const baseDirPath = path.resolve(process.cwd(), 'storage/uploads/signature');

    // Cek apakah foldernya ada
    if (!fs.existsSync(baseDirPath)) {
        console.warn(`Folder signature tidak ditemukan di: ${baseDirPath}`);
        return getFallbackTransparentPixel();
    }

    // 2. Baca semua file yang ada di dalam folder tersebut
    const files = fs.readdirSync(baseDirPath);

    // 3. Cari file yang nama depannya berawalan dengan slug kita
    // Ini akan mencocokkan "aditya" dengan "aditya-putra.jpeg"
    const matchedFile = files.find(file => {
        const fileNameOnly = file.toLowerCase().split('.')[0]; // ambil "rifai" dari "rifai.jpeg"

        // Cek apakah "ahmad-rifai" mengandung "rifai" 
        // ATAU "rifai" mengandung bagian dari "ahmad-rifai"
        return slugName.includes(fileNameOnly) || fileNameOnly.includes(slugName);
    });

    if (!matchedFile) {
        console.warn(`File tanda tangan tidak ditemukan untuk user: ${username}`);
        return getFallbackTransparentPixel();
    }

    const filePath = path.join(baseDirPath, matchedFile);
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');

    // 4. Deteksi Mime Type berdasarkan ekstensi file aslinya
    const ext = path.extname(matchedFile).toLowerCase();
    let mimeType = 'image/png'; // default

    if (ext === '.jpg' || ext === '.jpeg') {
        mimeType = 'image/jpeg';
    } else if (ext === '.svg') {
        mimeType = 'image/svg+xml';
    }

    return `data:${mimeType};base64,${base64}`;
}

// Helper untuk mengembalikan pixel kosong transparan agar PDF tidak error/rusak
function getFallbackTransparentPixel(): string {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
}
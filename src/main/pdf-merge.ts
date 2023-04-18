import PDFMerger from 'pdf-merger-js';

export async function mergeFiles(files: string[], destination : string) {
    const merger = new PDFMerger();
    for (const file of files) {
        await merger.add(file);
    }
    await merger.save(destination);
}
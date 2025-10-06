class Stimulus {
    constructor(fileName = '', base64 = '') {
        this.fileName = fileName;
        this.base64 = base64; // raw base64 (PNG), без префикса data URL
    }
    
    static async fromFile(file) {
        const dataUrl = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        const img = await new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = reject;
            i.src = dataUrl;
        });
        const off = document.createElement('canvas');
        off.width = img.naturalWidth || img.width;
        off.height = img.naturalHeight || img.height;
        const octx = off.getContext('2d');
        octx.drawImage(img, 0, 0, off.width, off.height);
        const pngUrl = off.toDataURL('image/png');
        const base64 = (pngUrl.split(',')[1]) || '';
        return new Stimulus(file.name, base64);
    }

    get dataURL() {
        return `data:image/png;base64,${this.base64}`;
    }

    toJSON() {
        return { fileName: this.fileName, base64: this.base64 };
    }

    static fromJSON(obj) {
        if (!obj) return null;
        return new Stimulus(obj.fileName || '', obj.base64 || '');
    }
}
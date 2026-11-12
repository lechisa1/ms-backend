"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadRoots = getUploadRoots;
exports.findFileOnDisk = findFileOnDisk;
exports.getUploadDestination = getUploadDestination;
const fs_1 = require("fs");
const path_1 = require("path");
function getUploadRoots() {
    const cwd = process.cwd();
    return [
        cwd,
        (0, path_1.join)(cwd, 'maintenance-system'),
        (0, path_1.join)(cwd, '..'),
        (0, path_1.join)(cwd, '..', 'maintenance-system'),
        (0, path_1.join)(__dirname, '..', '..', '..'),
        (0, path_1.join)(__dirname, '..', '..', '..', '..'),
    ];
}
function findFileOnDisk(fileName, storageKey) {
    if (!fileName && !storageKey)
        return null;
    const roots = getUploadRoots();
    const subfolders = ['requests', 'spec-requests', 'specifications', ''];
    if (storageKey) {
        for (const root of roots) {
            const p1 = (0, path_1.join)(root, 'uploads', storageKey);
            if ((0, fs_1.existsSync)(p1))
                return p1;
            const p2 = (0, path_1.join)(root, storageKey);
            if ((0, fs_1.existsSync)(p2))
                return p2;
        }
    }
    if (fileName) {
        for (const root of roots) {
            for (const sub of subfolders) {
                const candidate = sub
                    ? (0, path_1.join)(root, 'uploads', sub, fileName)
                    : (0, path_1.join)(root, 'uploads', fileName);
                if ((0, fs_1.existsSync)(candidate))
                    return candidate;
            }
        }
    }
    return null;
}
function getUploadDestination(subfolder) {
    const cwd = process.cwd();
    const isInsideMs = cwd.replace(/\\/g, '/').endsWith('/maintenance-system');
    const target = isInsideMs
        ? (0, path_1.join)(cwd, 'uploads', subfolder)
        : (0, fs_1.existsSync)((0, path_1.join)(cwd, 'maintenance-system'))
            ? (0, path_1.join)(cwd, 'maintenance-system', 'uploads', subfolder)
            : (0, path_1.join)(cwd, 'uploads', subfolder);
    (0, fs_1.mkdirSync)(target, { recursive: true });
    return target;
}
//# sourceMappingURL=file-upload.util.js.map
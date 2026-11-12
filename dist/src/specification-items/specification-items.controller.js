"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecificationItemsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const specification_items_service_1 = require("./specification-items.service");
const specification_item_dto_1 = require("./dto/specification-item.dto");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const file_upload_util_1 = require("../common/utils/file-upload.util");
const uploadOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            cb(null, (0, file_upload_util_1.getUploadDestination)('specifications'));
        },
        filename: (_req, file, cb) => {
            cb(null, `${(0, crypto_1.randomUUID)()}${(0, path_1.extname)(file.originalname)}`);
        },
    }),
    limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE_BYTES ?? 10485760),
        files: 10,
    },
};
let SpecificationItemsController = class SpecificationItemsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(requestId, dto) {
        return this.service.create(requestId, dto);
    }
    findByRequest(requestId) {
        return this.service.findByRequest(requestId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
    uploadFiles(id, userId, files = []) {
        return this.service.addFiles(id, userId, files ?? []);
    }
    async downloadFile(id, fileId, res) {
        const file = await this.service.getFile(id, fileId);
        const filePath = (0, file_upload_util_1.findFileOnDisk)(file.fileName, file.storageKey);
        if (!filePath) {
            throw new common_1.NotFoundException(`File ${file.fileName} not found on disk`);
        }
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName || file.fileName)}"`);
        (0, fs_1.createReadStream)(filePath).pipe(res);
    }
    async downloadFileDirect(fileId, res) {
        const file = await this.service.getFile(fileId, fileId);
        const filePath = (0, file_upload_util_1.findFileOnDisk)(file.fileName, file.storageKey);
        if (!filePath) {
            throw new common_1.NotFoundException(`File ${file.fileName} not found on disk`);
        }
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName || file.fileName)}"`);
        (0, fs_1.createReadStream)(filePath).pipe(res);
    }
    removeFile(id, fileId) {
        return this.service.removeFile(id, fileId);
    }
};
exports.SpecificationItemsController = SpecificationItemsController;
__decorate([
    (0, common_1.Post)('request/:requestId'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a specification item to a request' }),
    __param(0, (0, common_1.Param)('requestId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, specification_item_dto_1.CreateSpecificationItemDto]),
    __metadata("design:returntype", void 0)
], SpecificationItemsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('request/:requestId'),
    (0, swagger_1.ApiOperation)({ summary: 'Specification items of a request' }),
    __param(0, (0, common_1.Param)('requestId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SpecificationItemsController.prototype, "findByRequest", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specification item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SpecificationItemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a specification item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, specification_item_dto_1.UpdateSpecificationItemDto]),
    __metadata("design:returntype", void 0)
], SpecificationItemsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a specification item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SpecificationItemsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/files'),
    (0, permissions_decorator_1.RequirePermissions)('requests:create', 'requests:update'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, uploadOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Attach files to a specification item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", void 0)
], SpecificationItemsController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId/download'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Download or stream an attached specification item file' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SpecificationItemsController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)('files/:fileId/download'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Download or stream an attached specification item file directly by file ID' }),
    __param(0, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpecificationItemsController.prototype, "downloadFileDirect", null);
__decorate([
    (0, common_1.Delete)(':id/files/:fileId'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a specification item file' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SpecificationItemsController.prototype, "removeFile", null);
exports.SpecificationItemsController = SpecificationItemsController = __decorate([
    (0, swagger_1.ApiTags)('specification-items'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('specification-items'),
    __metadata("design:paramtypes", [specification_items_service_1.SpecificationItemsService])
], SpecificationItemsController);
//# sourceMappingURL=specification-items.controller.js.map
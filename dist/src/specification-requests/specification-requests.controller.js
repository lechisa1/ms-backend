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
exports.SpecificationRequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const specification_requests_service_1 = require("./specification-requests.service");
const create_specification_request_dto_1 = require("./dto/create-specification-request.dto");
const update_specification_request_dto_1 = require("./dto/update-specification-request.dto");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const file_upload_util_1 = require("../common/utils/file-upload.util");
const uploadOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            cb(null, (0, file_upload_util_1.getUploadDestination)('spec-requests'));
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
let SpecificationRequestsController = class SpecificationRequestsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto, userId) {
        return this.service.create(dto, userId);
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    stats(query) {
        return this.service.stats(query);
    }
    findByTicket(ticketNumber) {
        return this.service.findByTicketNumber(ticketNumber);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    changeStatus(id, dto, userId) {
        return this.service.changeStatus(id, dto, userId);
    }
    approve(id, dto, userId) {
        return this.service.approve(id, dto, userId);
    }
    reject(id, dto, userId) {
        return this.service.reject(id, dto, userId);
    }
    uploadFiles(id, userId, files = []) {
        return this.service.addFiles(id, userId, files ?? []);
    }
    listFiles(id) {
        return this.service.findOne(id).then((request) => request?.files ?? []);
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
    deleteFile(id, fileId) {
        return this.service.removeFile(id, fileId);
    }
    remove(id, user) {
        return this.service.remove(id, user);
    }
    restore(id) {
        return this.service.restore(id);
    }
};
exports.SpecificationRequestsController = SpecificationRequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('requests:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a specification request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_specification_request_dto_1.CreateSpecificationRequestDto, String]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List specification requests' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_specification_request_dto_1.QuerySpecificationRequestDto]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Specification request counts by status and priority' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_specification_request_dto_1.QuerySpecificationRequestDto]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('ticket/:ticketNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specification request by ticket number' }),
    __param(0, (0, common_1.Param)('ticketNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "findByTicket", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specification request with all items and attachments' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a specification request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_specification_request_dto_1.UpdateSpecificationRequestDto]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Change specification request status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_specification_request_dto_1.ChangeSpecificationStatusDto, String]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a specification request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_specification_request_dto_1.ApproveSpecificationRequestDto, String]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a specification request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_specification_request_dto_1.RejectSpecificationRequestDto, String]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/files'),
    (0, permissions_decorator_1.RequirePermissions)('requests:create', 'requests:update'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, uploadOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Attach files to a specification request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Get)(':id/files'),
    (0, swagger_1.ApiOperation)({ summary: 'Files attached to a specification request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId/download'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Download or stream an attached file from a specification request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], SpecificationRequestsController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)('files/:fileId/download'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Download or stream an attached file from a specification request directly by file ID' }),
    __param(0, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SpecificationRequestsController.prototype, "downloadFileDirect", null);
__decorate([
    (0, common_1.Delete)(':id/files/:fileId'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an attached file from a specification request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a specification request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('requests:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft deleted specification request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SpecificationRequestsController.prototype, "restore", null);
exports.SpecificationRequestsController = SpecificationRequestsController = __decorate([
    (0, swagger_1.ApiTags)('specification-requests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('specification-requests'),
    __metadata("design:paramtypes", [specification_requests_service_1.SpecificationRequestsService])
], SpecificationRequestsController);
//# sourceMappingURL=specification-requests.controller.js.map
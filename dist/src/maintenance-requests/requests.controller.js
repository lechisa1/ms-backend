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
exports.RequestsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const crypto_1 = require("crypto");
const requests_service_1 = require("./requests.service");
const create_request_dto_1 = require("./dto/create-request.dto");
const update_request_dto_1 = require("./dto/update-request.dto");
const query_my_tasks_dto_1 = require("./dto/query-my-tasks.dto");
const specification_items_service_1 = require("../specification-items/specification-items.service");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const file_upload_util_1 = require("../common/utils/file-upload.util");
const uploadOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: (_req, _file, cb) => {
            cb(null, (0, file_upload_util_1.getUploadDestination)('requests'));
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
let RequestsController = class RequestsController {
    requestsService;
    specificationItemsService;
    constructor(requestsService, specificationItemsService) {
        this.requestsService = requestsService;
        this.specificationItemsService = specificationItemsService;
    }
    create(dto, userId) {
        return this.requestsService.create(dto, userId);
    }
    findAll(query) {
        return this.requestsService.findAll(query);
    }
    stats(query) {
        return this.requestsService.stats(query);
    }
    getMyTasks(userId, query) {
        return this.requestsService.getMyTasks(userId, query);
    }
    findByTicket(ticketNumber) {
        return this.requestsService.findByTicketNumber(ticketNumber);
    }
    findOne(id) {
        return this.requestsService.findOne(id);
    }
    update(id, dto) {
        return this.requestsService.update(id, dto);
    }
    changeStatus(id, dto, userId) {
        return this.requestsService.changeStatus(id, dto, userId);
    }
    approve(id, dto, userId) {
        return this.requestsService.approve(id, dto?.notes, userId);
    }
    reject(id, dto, userId) {
        return this.requestsService.reject(id, dto?.reason, userId);
    }
    confirmCompletion(id, dto, userId) {
        return this.requestsService.confirmCompletion(id, dto?.notes, userId);
    }
    rejectWork(id, dto, userId) {
        return this.requestsService.rejectWork(id, dto?.reason, userId);
    }
    addUpdate(id, dto, userId) {
        return this.requestsService.addUpdate(id, {
            ...dto,
            userId: dto.userId ?? userId,
        });
    }
    statusHistory(id) {
        return this.requestsService.statusHistory(id);
    }
    uploadFiles(id, userId, files = []) {
        return this.requestsService.addFiles(id, userId, files ?? []);
    }
    listFiles(id) {
        return this.requestsService.findOne(id).then((request) => request?.files ?? []);
    }
    async downloadFile(id, fileId, res) {
        const file = await this.requestsService.getFile(id, fileId);
        const filePath = (0, file_upload_util_1.findFileOnDisk)(file.fileName, file.storageKey);
        if (!filePath) {
            throw new common_1.NotFoundException(`File ${file.fileName} not found on disk`);
        }
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName || file.fileName)}"`);
        (0, fs_1.createReadStream)(filePath).pipe(res);
    }
    async downloadFileDirect(fileId, res) {
        const file = await this.requestsService.getFile(fileId, fileId);
        const filePath = (0, file_upload_util_1.findFileOnDisk)(file.fileName, file.storageKey);
        if (!filePath) {
            throw new common_1.NotFoundException(`File ${file.fileName} not found on disk`);
        }
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName || file.fileName)}"`);
        (0, fs_1.createReadStream)(filePath).pipe(res);
    }
    deleteFile(id, fileId) {
        return this.requestsService.removeFile(id, fileId);
    }
    specificationItems(id) {
        return this.specificationItemsService.findByRequest(id);
    }
    remove(id, user) {
        return this.requestsService.remove(id, user);
    }
    restore(id) {
        return this.requestsService.restore(id);
    }
};
exports.RequestsController = RequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('requests:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a maintenance request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_request_dto_1.CreateMaintenanceRequestDto, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List maintenance requests' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_request_dto_1.QueryMaintenanceRequestDto]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Request counts by status and priority' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_request_dto_1.QueryMaintenanceRequestDto]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('my-tasks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get assigned tasks and requests requiring review for current user' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_my_tasks_dto_1.QueryMyTasksDto]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "getMyTasks", null);
__decorate([
    (0, common_1.Get)('ticket/:ticketNumber'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a request by ticket number' }),
    __param(0, (0, common_1.Param)('ticketNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findByTicket", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a request with all related data' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_request_dto_1.UpdateMaintenanceRequestDto]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Change request status' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_request_dto_1.ChangeStatusDto, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "changeStatus", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(':id/confirm-completion'),
    (0, swagger_1.ApiOperation)({ summary: 'Requester confirms technician work completion' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "confirmCompletion", null);
__decorate([
    (0, common_1.Post)(':id/reject-work'),
    (0, swagger_1.ApiOperation)({ summary: 'Requester rejects technician work and requests rework' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "rejectWork", null);
__decorate([
    (0, common_1.Post)(':id/updates'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a progress update to a request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_request_dto_1.AddRequestUpdateDto, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "addUpdate", null);
__decorate([
    (0, common_1.Get)(':id/status-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Status history of a request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "statusHistory", null);
__decorate([
    (0, common_1.Post)(':id/files'),
    (0, permissions_decorator_1.RequirePermissions)('requests:create', 'requests:update'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, uploadOptions)),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Attach files to a request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Get)(':id/files'),
    (0, swagger_1.ApiOperation)({ summary: 'Files attached to a request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "listFiles", null);
__decorate([
    (0, common_1.Get)(':id/files/:fileId/download'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Download or stream an attached file' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)('files/:fileId/download'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Download or stream an attached file directly by file ID' }),
    __param(0, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RequestsController.prototype, "downloadFileDirect", null);
__decorate([
    (0, common_1.Delete)(':id/files/:fileId'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete an attached file' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('fileId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Get)(':id/specification-items'),
    (0, swagger_1.ApiOperation)({ summary: 'Specification items of a request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "specificationItems", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('requests:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft deleted request' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestsController.prototype, "restore", null);
exports.RequestsController = RequestsController = __decorate([
    (0, swagger_1.ApiTags)('maintenance-requests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('requests'),
    __metadata("design:paramtypes", [requests_service_1.RequestsService,
        specification_items_service_1.SpecificationItemsService])
], RequestsController);
//# sourceMappingURL=requests.controller.js.map
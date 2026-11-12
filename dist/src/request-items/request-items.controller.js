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
exports.RequestItemsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const request_items_service_1 = require("./request-items.service");
const request_item_dto_1 = require("./dto/request-item.dto");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let RequestItemsController = class RequestItemsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findByRequest(requestId) {
        return this.service.findByRequest(requestId);
    }
    create(requestId, dto) {
        return this.service.create(requestId, dto);
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
    assignTechnicians(id, dto, userId) {
        return this.service.assignTechnicians(id, dto, userId);
    }
    updateAssignment(assignmentId, dto, userId) {
        return this.service.updateAssignment(assignmentId, dto, userId);
    }
    unassignTechnician(id, assignmentId) {
        return this.service.unassignTechnician(id, assignmentId);
    }
    findByTechnician(technicianId) {
        return this.service.findByTechnician(technicianId);
    }
};
exports.RequestItemsController = RequestItemsController;
__decorate([
    (0, common_1.Get)('requests/:requestId/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Items of a maintenance request' }),
    __param(0, (0, common_1.Param)('requestId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestItemsController.prototype, "findByRequest", null);
__decorate([
    (0, common_1.Post)('requests/:requestId/items'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Add an item to a request' }),
    __param(0, (0, common_1.Param)('requestId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_item_dto_1.CreateRequestItemDto]),
    __metadata("design:returntype", void 0)
], RequestItemsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('request-items/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a request item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestItemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('request-items/:id'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a request item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RequestItemsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('request-items/:id'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a request item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestItemsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('request-items/:id/technicians'),
    (0, permissions_decorator_1.RequirePermissions)('tasks:ict-director'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign technicians to a request item' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_item_dto_1.AssignTechnicianDto, String]),
    __metadata("design:returntype", void 0)
], RequestItemsController.prototype, "assignTechnicians", null);
__decorate([
    (0, common_1.Patch)('item-technicians/:assignmentId'),
    (0, permissions_decorator_1.RequirePermissions)('tasks:technician', 'tasks:ict-director', 'requests:assign-technicians'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a technician assignment status' }),
    __param(0, (0, common_1.Param)('assignmentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, request_item_dto_1.UpdateTechnicianAssignmentDto, String]),
    __metadata("design:returntype", void 0)
], RequestItemsController.prototype, "updateAssignment", null);
__decorate([
    (0, common_1.Delete)('request-items/:id/technicians/:assignmentId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('tasks:ict-director'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a technician assignment' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('assignmentId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RequestItemsController.prototype, "unassignTechnician", null);
__decorate([
    (0, common_1.Get)('technicians/:technicianId/assignments'),
    (0, swagger_1.ApiOperation)({ summary: 'Assignments of a technician' }),
    __param(0, (0, common_1.Param)('technicianId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RequestItemsController.prototype, "findByTechnician", null);
exports.RequestItemsController = RequestItemsController = __decorate([
    (0, swagger_1.ApiTags)('request-items'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [request_items_service_1.RequestItemsService])
], RequestItemsController);
//# sourceMappingURL=request-items.controller.js.map
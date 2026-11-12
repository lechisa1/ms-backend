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
exports.MaintenanceCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const maintenance_categories_service_1 = require("./maintenance-categories.service");
const maintenance_category_dto_1 = require("./dto/maintenance-category.dto");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let MaintenanceCategoriesController = class MaintenanceCategoriesController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll(query) {
        return this.service.findAll(query);
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
};
exports.MaintenanceCategoriesController = MaintenanceCategoriesController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('requests:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a maintenance category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [maintenance_category_dto_1.CreateMaintenanceCategoryDto]),
    __metadata("design:returntype", void 0)
], MaintenanceCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List maintenance categories' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], MaintenanceCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a maintenance category' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceCategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('requests:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a maintenance category' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, maintenance_category_dto_1.UpdateMaintenanceCategoryDto]),
    __metadata("design:returntype", void 0)
], MaintenanceCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('requests:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a maintenance category' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MaintenanceCategoriesController.prototype, "remove", null);
exports.MaintenanceCategoriesController = MaintenanceCategoriesController = __decorate([
    (0, swagger_1.ApiTags)('maintenance-categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('maintenance-categories'),
    __metadata("design:paramtypes", [maintenance_categories_service_1.MaintenanceCategoriesService])
], MaintenanceCategoriesController);
//# sourceMappingURL=maintenance-categories.controller.js.map
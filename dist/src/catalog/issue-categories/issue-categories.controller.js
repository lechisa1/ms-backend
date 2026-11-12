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
exports.IssueCategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const issue_categories_service_1 = require("./issue-categories.service");
const issue_category_dto_1 = require("./dto/issue-category.dto");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let IssueCategoriesController = class IssueCategoriesController {
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
    restore(id) {
        return this.service.restore(id);
    }
};
exports.IssueCategoriesController = IssueCategoriesController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('issue-types:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an issue category' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [issue_category_dto_1.CreateIssueCategoryDto]),
    __metadata("design:returntype", void 0)
], IssueCategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List issue categories' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [issue_category_dto_1.QueryIssueCategoryDto]),
    __metadata("design:returntype", void 0)
], IssueCategoriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an issue category' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IssueCategoriesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('issue-types:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an issue category' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, issue_category_dto_1.UpdateIssueCategoryDto]),
    __metadata("design:returntype", void 0)
], IssueCategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('issue-types:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete an issue category' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IssueCategoriesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('issue-types:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft deleted issue category' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IssueCategoriesController.prototype, "restore", null);
exports.IssueCategoriesController = IssueCategoriesController = __decorate([
    (0, swagger_1.ApiTags)('issue-categories'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('issue-categories'),
    __metadata("design:paramtypes", [issue_categories_service_1.IssueCategoriesService])
], IssueCategoriesController);
//# sourceMappingURL=issue-categories.controller.js.map
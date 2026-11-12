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
exports.OrganizationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organization_service_1 = require("./organization.service");
const organization_unit_dto_1 = require("./dto/organization-unit.dto");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
let OrganizationController = class OrganizationController {
    organizationService;
    constructor(organizationService) {
        this.organizationService = organizationService;
    }
    create(dto) {
        return this.organizationService.create(dto);
    }
    findAll(query) {
        return this.organizationService.findAll(query);
    }
    tree() {
        return this.organizationService.tree();
    }
    findTypes() {
        return this.organizationService.findTypes();
    }
    findOne(id) {
        return this.organizationService.findOne(id);
    }
    children(id) {
        return this.organizationService.children(id);
    }
    members(id) {
        return this.organizationService.members(id);
    }
    update(id, dto) {
        return this.organizationService.update(id, dto);
    }
    move(id, dto) {
        return this.organizationService.move(id, dto);
    }
    assignSupervisor(id, dto) {
        return this.organizationService.assignSupervisor(id, dto);
    }
    remove(id) {
        return this.organizationService.remove(id);
    }
    restore(id) {
        return this.organizationService.restore(id);
    }
};
exports.OrganizationController = OrganizationController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('organization:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create an organization unit' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [organization_unit_dto_1.CreateOrganizationUnitDto]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List organization units' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({ summary: 'Organization tree' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "tree", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({ summary: 'List seeded organization unit types' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "findTypes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an organization unit' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/children'),
    (0, swagger_1.ApiOperation)({ summary: 'Direct children of a unit' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "children", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: 'Users belonging to a unit' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "members", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('organization:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update an organization unit' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organization_unit_dto_1.UpdateOrganizationUnitDto]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/move'),
    (0, permissions_decorator_1.RequirePermissions)('organization:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Move a unit under a new parent' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organization_unit_dto_1.MoveOrganizationUnitDto]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "move", null);
__decorate([
    (0, common_1.Put)(':id/supervisor'),
    (0, permissions_decorator_1.RequirePermissions)('organization:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign or clear the unit supervisor' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, organization_unit_dto_1.AssignSupervisorDto]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "assignSupervisor", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('organization:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete an organization unit' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('organization:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft deleted unit' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganizationController.prototype, "restore", null);
exports.OrganizationController = OrganizationController = __decorate([
    (0, swagger_1.ApiTags)('organization'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('organization-units'),
    __metadata("design:paramtypes", [organization_service_1.OrganizationService])
], OrganizationController);
//# sourceMappingURL=organization.controller.js.map
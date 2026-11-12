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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const query_user_dto_1 = require("./dto/query-user.dto");
const assign_roles_dto_1 = require("./dto/assign-roles.dto");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    create(dto) {
        return this.usersService.create(dto);
    }
    findAll(query) {
        return this.usersService.findAll(query);
    }
    technicians() {
        return this.usersService.technicians();
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, dto) {
        return this.usersService.update(id, dto);
    }
    resetPassword(id, dto) {
        return this.usersService.resetPassword(id, dto);
    }
    assignRoles(id, dto) {
        return this.usersService.assignRoles(id, dto);
    }
    assignPermissions(id, dto) {
        return this.usersService.assignPermissions(id, dto);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
    restore(id) {
        return this.usersService.restore(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('users:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('users:read'),
    (0, swagger_1.ApiOperation)({ summary: 'List users' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_user_dto_1.QueryUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('technicians'),
    (0, swagger_1.ApiOperation)({ summary: 'List active technicians' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "technicians", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a user' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('users:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a user' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/password'),
    (0, permissions_decorator_1.RequirePermissions)('users:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset a user password' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Put)(':id/roles'),
    (0, permissions_decorator_1.RequirePermissions)('users:assign-roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Replace user roles' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_roles_dto_1.AssignRolesDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "assignRoles", null);
__decorate([
    (0, common_1.Put)(':id/permissions'),
    (0, permissions_decorator_1.RequirePermissions)('users:assign-permissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Replace direct permission grants' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_roles_dto_1.AssignPermissionsDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "assignPermissions", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('users:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete a user' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/restore'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, permissions_decorator_1.RequirePermissions)('users:update'),
    (0, swagger_1.ApiOperation)({ summary: 'Restore a soft deleted user' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "restore", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
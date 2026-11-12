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
exports.WorkLogsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const work_logs_service_1 = require("./work-logs.service");
const work_log_dto_1 = require("./dto/work-log.dto");
const query_work_log_dto_1 = require("./dto/query-work-log.dto");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
let WorkLogsController = class WorkLogsController {
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
    findOne(id) {
        return this.service.findOne(id);
    }
    review(id, dto, userId) {
        return this.service.review(id, dto, userId);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.WorkLogsController = WorkLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('work-logs:create'),
    (0, swagger_1.ApiOperation)({ summary: 'Log work done on a request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [work_log_dto_1.CreateWorkLogDto, String]),
    __metadata("design:returntype", void 0)
], WorkLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List work logs' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_work_log_dto_1.QueryWorkLogDto]),
    __metadata("design:returntype", void 0)
], WorkLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a work log' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkLogsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, permissions_decorator_1.RequirePermissions)('work-logs:review'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept or reject a work log' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, work_log_dto_1.ReviewWorkLogDto, String]),
    __metadata("design:returntype", void 0)
], WorkLogsController.prototype, "review", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('work-logs:delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a work log' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkLogsController.prototype, "remove", null);
exports.WorkLogsController = WorkLogsController = __decorate([
    (0, swagger_1.ApiTags)('work-logs'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('work-logs'),
    __metadata("design:paramtypes", [work_logs_service_1.WorkLogsService])
], WorkLogsController);
//# sourceMappingURL=work-logs.controller.js.map
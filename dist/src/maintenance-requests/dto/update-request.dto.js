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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddRequestUpdateDto = exports.ChangeStatusDto = exports.QueryMaintenanceRequestDto = exports.UpdateMaintenanceRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const create_request_dto_1 = require("./create-request.dto");
class UpdateMaintenanceRequestDto extends (0, swagger_1.PartialType)(create_request_dto_1.CreateMaintenanceRequestDto) {
}
exports.UpdateMaintenanceRequestDto = UpdateMaintenanceRequestDto;
class QueryMaintenanceRequestDto extends pagination_dto_1.PaginationDto {
    requesterId;
    organizationUnitId;
    status;
    statuses;
    priority;
    requestType;
    ticketNumber;
}
exports.QueryMaintenanceRequestDto = QueryMaintenanceRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by requester user ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryMaintenanceRequestDto.prototype, "requesterId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by organization unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryMaintenanceRequestDto.prototype, "organizationUnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RequestStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestStatus),
    __metadata("design:type", String)
], QueryMaintenanceRequestDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comma separated RequestStatus values' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMaintenanceRequestDto.prototype, "statuses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RequestPriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestPriority),
    __metadata("design:type", String)
], QueryMaintenanceRequestDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['MAINTENANCE', 'SPECIFICATION'], description: 'Request type filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMaintenanceRequestDto.prototype, "requestType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ticket number search' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryMaintenanceRequestDto.prototype, "ticketNumber", void 0);
class ChangeStatusDto {
    status;
    reason;
}
exports.ChangeStatusDto = ChangeStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RequestStatus }),
    (0, class_validator_1.IsEnum)(client_1.RequestStatus),
    __metadata("design:type", String)
], ChangeStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangeStatusDto.prototype, "reason", void 0);
class AddRequestUpdateDto {
    updateType;
    updateText;
    userId;
}
exports.AddRequestUpdateDto = AddRequestUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'DIAGNOSIS', description: 'Update type' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], AddRequestUpdateDto.prototype, "updateType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Motherboard replaced and testing started' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddRequestUpdateDto.prototype, "updateText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddRequestUpdateDto.prototype, "userId", void 0);
//# sourceMappingURL=update-request.dto.js.map
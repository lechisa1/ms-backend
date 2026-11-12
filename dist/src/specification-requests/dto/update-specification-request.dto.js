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
exports.RejectSpecificationRequestDto = exports.ApproveSpecificationRequestDto = exports.ChangeSpecificationStatusDto = exports.QuerySpecificationRequestDto = exports.UpdateSpecificationRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
const create_specification_request_dto_1 = require("./create-specification-request.dto");
class UpdateSpecificationRequestDto extends (0, swagger_1.PartialType)(create_specification_request_dto_1.CreateSpecificationRequestDto) {
}
exports.UpdateSpecificationRequestDto = UpdateSpecificationRequestDto;
class QuerySpecificationRequestDto extends pagination_dto_1.PaginationDto {
    requesterId;
    organizationUnitId;
    status;
    statuses;
    priority;
    ticketNumber;
}
exports.QuerySpecificationRequestDto = QuerySpecificationRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by requester user ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QuerySpecificationRequestDto.prototype, "requesterId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by organization unit ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QuerySpecificationRequestDto.prototype, "organizationUnitId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RequestStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestStatus),
    __metadata("design:type", String)
], QuerySpecificationRequestDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comma separated RequestStatus values' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySpecificationRequestDto.prototype, "statuses", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RequestPriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestPriority),
    __metadata("design:type", String)
], QuerySpecificationRequestDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ticket number search' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySpecificationRequestDto.prototype, "ticketNumber", void 0);
class ChangeSpecificationStatusDto {
    status;
    reason;
}
exports.ChangeSpecificationStatusDto = ChangeSpecificationStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.RequestStatus }),
    (0, class_validator_1.IsEnum)(client_1.RequestStatus),
    __metadata("design:type", String)
], ChangeSpecificationStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangeSpecificationStatusDto.prototype, "reason", void 0);
class ApproveSpecificationRequestDto {
    notes;
}
exports.ApproveSpecificationRequestDto = ApproveSpecificationRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Optional approval notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveSpecificationRequestDto.prototype, "notes", void 0);
class RejectSpecificationRequestDto {
    reason;
}
exports.RejectSpecificationRequestDto = RejectSpecificationRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for rejecting the specification request',
        example: 'Specification details incomplete or not aligned with IT standards',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectSpecificationRequestDto.prototype, "reason", void 0);
//# sourceMappingURL=update-specification-request.dto.js.map
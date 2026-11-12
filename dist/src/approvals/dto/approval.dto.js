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
exports.QueryApprovalRequestDto = exports.ReviewApprovalDto = exports.CreateApprovalRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../common/dto/pagination.dto");
class CreateApprovalRequestDto {
    maintenanceRequestId;
    maintenanceRequestItemId;
    technicianId;
    notes;
}
exports.CreateApprovalRequestDto = CreateApprovalRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateApprovalRequestDto.prototype, "maintenanceRequestId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateApprovalRequestDto.prototype, "maintenanceRequestItemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateApprovalRequestDto.prototype, "technicianId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApprovalRequestDto.prototype, "notes", void 0);
class ReviewApprovalDto {
    status;
    notes;
}
exports.ReviewApprovalDto = ReviewApprovalDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [client_1.ApprovalStatus.APPROVED, client_1.ApprovalStatus.REJECTED] }),
    (0, class_validator_1.IsEnum)(client_1.ApprovalStatus),
    __metadata("design:type", String)
], ReviewApprovalDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewApprovalDto.prototype, "notes", void 0);
class QueryApprovalRequestDto extends pagination_dto_1.PaginationDto {
    maintenanceRequestId;
    technicianId;
    status;
}
exports.QueryApprovalRequestDto = QueryApprovalRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryApprovalRequestDto.prototype, "maintenanceRequestId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], QueryApprovalRequestDto.prototype, "technicianId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.ApprovalStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.ApprovalStatus),
    __metadata("design:type", String)
], QueryApprovalRequestDto.prototype, "status", void 0);
//# sourceMappingURL=approval.dto.js.map
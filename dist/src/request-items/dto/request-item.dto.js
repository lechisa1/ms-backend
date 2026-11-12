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
exports.UpdateTechnicianAssignmentDto = exports.AssignTechnicianDto = exports.CreateRequestItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class CreateRequestItemDto {
    itemId;
    issueCategoryId;
    issueTypeId;
    priority;
    description;
}
exports.CreateRequestItemDto = CreateRequestItemDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRequestItemDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRequestItemDto.prototype, "issueCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateRequestItemDto.prototype, "issueTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.RequestPriority }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestPriority),
    __metadata("design:type", String)
], CreateRequestItemDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRequestItemDto.prototype, "description", void 0);
class AssignTechnicianDto {
    technicianIds;
    leadTechnicianId;
    isLead;
    roleInAssignment;
    notes;
}
exports.AssignTechnicianDto = AssignTechnicianDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], AssignTechnicianDto.prototype, "technicianIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AssignTechnicianDto.prototype, "leadTechnicianId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AssignTechnicianDto.prototype, "isLead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.AssignmentRole }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AssignmentRole),
    __metadata("design:type", String)
], AssignTechnicianDto.prototype, "roleInAssignment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignTechnicianDto.prototype, "notes", void 0);
class UpdateTechnicianAssignmentDto {
    status;
    isLead;
    roleInAssignment;
    notes;
}
exports.UpdateTechnicianAssignmentDto = UpdateTechnicianAssignmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.TechnicianAssignmentStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.TechnicianAssignmentStatus),
    __metadata("design:type", String)
], UpdateTechnicianAssignmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateTechnicianAssignmentDto.prototype, "isLead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.AssignmentRole }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.AssignmentRole),
    __metadata("design:type", String)
], UpdateTechnicianAssignmentDto.prototype, "roleInAssignment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTechnicianAssignmentDto.prototype, "notes", void 0);
//# sourceMappingURL=request-item.dto.js.map
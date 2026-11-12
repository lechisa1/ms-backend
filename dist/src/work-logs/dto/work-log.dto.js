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
exports.ReviewWorkLogDto = exports.CreateWorkLogDto = exports.WorkLogMaterialInputDto = exports.WorkLogItemInputDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class WorkLogItemInputDto {
    requestItemId;
    notes;
}
exports.WorkLogItemInputDto = WorkLogItemInputDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maintenance Request Item ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], WorkLogItemInputDto.prototype, "requestItemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Specific notes for this item' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkLogItemInputDto.prototype, "notes", void 0);
class WorkLogMaterialInputDto {
    id;
    name;
    quantity;
    unit;
}
exports.WorkLogMaterialInputDto = WorkLogMaterialInputDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Material ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkLogMaterialInputDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'RAM 16GB DDR4', description: 'Name of the material or part used' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkLogMaterialInputDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2, description: 'Quantity used' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], WorkLogMaterialInputDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pcs', description: 'Unit of measure' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkLogMaterialInputDto.prototype, "unit", void 0);
class CreateWorkLogDto {
    requestId;
    technicianId;
    workDone;
    activity;
    completionNotes;
    additionalNotes;
    timeSpentMinutes;
    status;
    assignmentId;
    itemTechnicianId;
    itemId;
    items;
    materials;
}
exports.CreateWorkLogDto = CreateWorkLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Maintenance Request ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "requestId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Technician User ID (defaults to authenticated user)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "technicianId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Summary of work performed', example: 'Diagnosed power fault and replaced blown capacitor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "workDone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Frontend alias for workDone', example: 'Diagnosed power fault and replaced blown capacitor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "activity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Completion or diagnostic notes', example: 'Tested stability for 30 minutes, all tests passed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "completionNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Frontend alias for completionNotes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "additionalNotes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 45, description: 'Time spent in minutes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateWorkLogDto.prototype, "timeSpentMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Status of the assignment (COMPLETED or NOT_FIXED)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Assignment ID (ItemTechnician ID)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "assignmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ItemTechnician ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "itemTechnicianId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Specific Request Item ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateWorkLogDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [WorkLogItemInputDto], description: 'Items serviced in this work log' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkLogItemInputDto),
    __metadata("design:type", Array)
], CreateWorkLogDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [WorkLogMaterialInputDto], description: 'Materials or parts used' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkLogMaterialInputDto),
    __metadata("design:type", Array)
], CreateWorkLogDto.prototype, "materials", void 0);
class ReviewWorkLogDto {
    status;
    rejectionReason;
}
exports.ReviewWorkLogDto = ReviewWorkLogDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: [client_1.WorkLogStatus.ACCEPTED, client_1.WorkLogStatus.REJECTED] }),
    (0, class_validator_1.IsEnum)(client_1.WorkLogStatus),
    __metadata("design:type", String)
], ReviewWorkLogDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for rejection if rejected' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewWorkLogDto.prototype, "rejectionReason", void 0);
//# sourceMappingURL=work-log.dto.js.map
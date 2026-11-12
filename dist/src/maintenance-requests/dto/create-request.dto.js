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
exports.CreateRequestItemDto = exports.CreateMaintenanceRequestDto = exports.CreateMaintenanceItemDto = exports.RequestTypeEnum = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var RequestTypeEnum;
(function (RequestTypeEnum) {
    RequestTypeEnum["MAINTENANCE"] = "MAINTENANCE";
    RequestTypeEnum["SPECIFICATION"] = "SPECIFICATION";
    RequestTypeEnum["OTHER"] = "OTHER";
})(RequestTypeEnum || (exports.RequestTypeEnum = RequestTypeEnum = {}));
class CreateMaintenanceItemDto {
    itemId;
    issueCategoryId;
    issueTypeId;
    priority;
    description;
}
exports.CreateMaintenanceItemDto = CreateMaintenanceItemDto;
exports.CreateRequestItemDto = CreateMaintenanceItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Registered asset/item ID',
        example: 'item-1',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceItemDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Issue category ID (e.g. Hardware, Software)',
        example: 'icat-1',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceItemDto.prototype, "issueCategoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Issue type ID (e.g. Not Powering On)',
        example: 'issue-1',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceItemDto.prototype, "issueTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.RequestPriority,
        default: client_1.RequestPriority.MEDIUM,
        description: 'Priority of this asset repair',
    }),
    (0, class_validator_1.IsEnum)(client_1.RequestPriority),
    __metadata("design:type", String)
], CreateMaintenanceItemDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Specific description of the issue on this asset',
        example: 'Screen flickers when moved',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceItemDto.prototype, "description", void 0);
class CreateMaintenanceRequestDto {
    title;
    description;
    priority;
    items;
    maintenanceItems;
}
exports.CreateMaintenanceRequestDto = CreateMaintenanceRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Request title',
        example: 'Laptop and Monitor maintenance for Finance office',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateMaintenanceRequestDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'General description of the maintenance request',
        example: 'Several devices in room 204 require repair',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMaintenanceRequestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.RequestPriority,
        default: client_1.RequestPriority.MEDIUM,
        description: 'Overall request priority',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestPriority),
    __metadata("design:type", String)
], CreateMaintenanceRequestDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        type: [CreateMaintenanceItemDto],
        description: 'List of registered assets and their issues',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateMaintenanceItemDto),
    __metadata("design:type", Array)
], CreateMaintenanceRequestDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateMaintenanceItemDto),
    __metadata("design:type", Array)
], CreateMaintenanceRequestDto.prototype, "maintenanceItems", void 0);
//# sourceMappingURL=create-request.dto.js.map
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
exports.CreateSpecificationRequestDto = exports.CreateSpecificationItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateSpecificationItemDto {
    categoryId;
    requestedItemName;
    quantity;
    unitOfMeasure;
    priority;
    description;
    itemCategoryId;
    itemName;
}
exports.CreateSpecificationItemDto = CreateSpecificationItemDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Item category ID',
        example: 'icat-electronics',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpecificationItemDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Name of the requested item',
        example: 'Dell Latitude 5540 Laptop',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(180),
    __metadata("design:type", String)
], CreateSpecificationItemDto.prototype, "requestedItemName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantity needed',
        example: 3,
        default: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSpecificationItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Unit of measure (e.g. units, pcs, reams)',
        example: 'units',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateSpecificationItemDto.prototype, "unitOfMeasure", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.RequestPriority,
        default: client_1.RequestPriority.MEDIUM,
        description: 'Item priority',
    }),
    (0, class_validator_1.IsEnum)(client_1.RequestPriority),
    __metadata("design:type", String)
], CreateSpecificationItemDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Justification / why item is needed',
        example: 'For new engineering staff joining in Q1',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpecificationItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpecificationItemDto.prototype, "itemCategoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpecificationItemDto.prototype, "itemName", void 0);
class CreateSpecificationRequestDto {
    title;
    description;
    priority;
    items;
    specificationItems;
}
exports.CreateSpecificationRequestDto = CreateSpecificationRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Specification request title',
        example: 'Laptop and Accessories Request for New Staff',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateSpecificationRequestDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'General description or justification',
        example: 'Request 3 laptops for new staff members and related accessories',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpecificationRequestDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.RequestPriority,
        default: client_1.RequestPriority.MEDIUM,
        description: 'Overall request priority',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.RequestPriority),
    __metadata("design:type", String)
], CreateSpecificationRequestDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: [CreateSpecificationItemDto],
        description: 'List of requested items and quantities',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateSpecificationItemDto),
    __metadata("design:type", Array)
], CreateSpecificationRequestDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateSpecificationItemDto),
    __metadata("design:type", Array)
], CreateSpecificationRequestDto.prototype, "specificationItems", void 0);
//# sourceMappingURL=create-specification-request.dto.js.map
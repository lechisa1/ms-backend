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
exports.QueryIssueCategoryDto = exports.UpdateIssueCategoryDto = exports.CreateIssueCategoryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const pagination_dto_1 = require("../../../common/dto/pagination.dto");
class CreateIssueCategoryDto {
    name;
    slug;
    description;
    isActive;
}
exports.CreateIssueCategoryDto = CreateIssueCategoryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mechanical' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateIssueCategoryDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'mechanical' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(140),
    __metadata("design:type", String)
], CreateIssueCategoryDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateIssueCategoryDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateIssueCategoryDto.prototype, "isActive", void 0);
class UpdateIssueCategoryDto extends (0, swagger_1.PartialType)(CreateIssueCategoryDto) {
}
exports.UpdateIssueCategoryDto = UpdateIssueCategoryDto;
class QueryIssueCategoryDto extends pagination_dto_1.PaginationDto {
    isActive;
}
exports.QueryIssueCategoryDto = QueryIssueCategoryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === undefined ? undefined : value === 'true' || value === true),
    __metadata("design:type", Boolean)
], QueryIssueCategoryDto.prototype, "isActive", void 0);
//# sourceMappingURL=issue-category.dto.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueCategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const issue_categories_controller_1 = require("./issue-categories.controller");
const issue_categories_service_1 = require("./issue-categories.service");
let IssueCategoriesModule = class IssueCategoriesModule {
};
exports.IssueCategoriesModule = IssueCategoriesModule;
exports.IssueCategoriesModule = IssueCategoriesModule = __decorate([
    (0, common_1.Module)({
        controllers: [issue_categories_controller_1.IssueCategoriesController],
        providers: [issue_categories_service_1.IssueCategoriesService],
        exports: [issue_categories_service_1.IssueCategoriesService],
    })
], IssueCategoriesModule);
//# sourceMappingURL=issue-categories.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemCategoriesModule = void 0;
const common_1 = require("@nestjs/common");
const item_categories_controller_1 = require("./item-categories.controller");
const item_categories_service_1 = require("./item-categories.service");
let ItemCategoriesModule = class ItemCategoriesModule {
};
exports.ItemCategoriesModule = ItemCategoriesModule;
exports.ItemCategoriesModule = ItemCategoriesModule = __decorate([
    (0, common_1.Module)({
        controllers: [item_categories_controller_1.ItemCategoriesController],
        providers: [item_categories_service_1.ItemCategoriesService],
        exports: [item_categories_service_1.ItemCategoriesService],
    })
], ItemCategoriesModule);
//# sourceMappingURL=item-categories.module.js.map
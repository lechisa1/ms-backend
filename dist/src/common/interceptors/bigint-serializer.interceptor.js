"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigIntSerializerInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
function serializeBigInts(value, seen = new WeakSet()) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    if (value === null || typeof value !== 'object') {
        return value;
    }
    if (value instanceof Date || value instanceof RegExp || Buffer.isBuffer(value)) {
        return value;
    }
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
    if (Array.isArray(value)) {
        return value.map((item) => serializeBigInts(item, seen));
    }
    if (typeof value.pipe === 'function' || value.constructor?.name === 'Socket') {
        return value;
    }
    const result = {};
    for (const [key, item] of Object.entries(value)) {
        result[key] = serializeBigInts(item, seen);
    }
    return result;
}
let BigIntSerializerInterceptor = class BigIntSerializerInterceptor {
    intercept(_context, next) {
        return next.handle().pipe((0, operators_1.map)((data) => serializeBigInts(data)));
    }
};
exports.BigIntSerializerInterceptor = BigIntSerializerInterceptor;
exports.BigIntSerializerInterceptor = BigIntSerializerInterceptor = __decorate([
    (0, common_1.Injectable)()
], BigIntSerializerInterceptor);
//# sourceMappingURL=bigint-serializer.interceptor.js.map
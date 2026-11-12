"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecuritySanitizerPipe = void 0;
exports.containsExecutableScript = containsExecutableScript;
exports.containsHtmlOrScript = containsHtmlOrScript;
exports.sanitizeLongFormText = sanitizeLongFormText;
exports.sanitizeInput = sanitizeInput;
const common_1 = require("@nestjs/common");
const LONG_FORM_FIELDS = new Set([
    'description',
    'notes',
    'completionnotes',
    'reason',
    'rejectionreason',
    'activity',
    'workdone',
    'updatetext',
    'details',
    'comment',
    'comments',
    'message',
    'payload',
]);
const SCRIPT_PATTERNS = [
    /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
    /<\s*script\b[^>]*>/gi,
    /<\s*\/\s*script\s*>/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /data\s*:\s*text\/html/gi,
    /\bon[a-z]{3,}\s*=/gi,
    /<\s*\/?\s*(iframe|embed|object|applet|meta|link|style|base)\b[^>]*>/gi,
    /expression\s*\(/gi,
];
function containsExecutableScript(value) {
    if (typeof value !== 'string')
        return false;
    return SCRIPT_PATTERNS.some((pattern) => {
        pattern.lastIndex = 0;
        return pattern.test(value);
    });
}
function containsHtmlOrScript(value) {
    if (typeof value !== 'string')
        return false;
    if (containsExecutableScript(value))
        return true;
    return /<\s*\/?[a-z][^>]*>/i.test(value);
}
function sanitizeLongFormText(value) {
    if (typeof value !== 'string')
        return value;
    let sanitized = value;
    for (const pattern of SCRIPT_PATTERNS) {
        pattern.lastIndex = 0;
        sanitized = sanitized.replace(pattern, '');
    }
    return sanitized.trim();
}
function sanitizeInput(val, fieldKey = '') {
    if (val === null || val === undefined)
        return val;
    if (typeof val === 'string') {
        const lowerKey = fieldKey.toLowerCase();
        const isLongForm = LONG_FORM_FIELDS.has(lowerKey);
        if (isLongForm) {
            return sanitizeLongFormText(val);
        }
        if (lowerKey === 'password' ||
            lowerKey === 'currentpassword' ||
            lowerKey === 'newpassword' ||
            lowerKey === 'confirmpassword') {
            if (containsExecutableScript(val)) {
                throw new common_1.BadRequestException('Disallowed executable script pattern detected in password.');
            }
            return val;
        }
        if (containsExecutableScript(val) || containsHtmlOrScript(val)) {
            throw new common_1.BadRequestException(`Input in field '${fieldKey || 'input'}' contains disallowed executable script or HTML tags.`);
        }
        return val;
    }
    if (Array.isArray(val)) {
        return val.map((item) => sanitizeInput(item, fieldKey));
    }
    if (typeof val === 'object') {
        const sanitizedObj = {};
        for (const [k, v] of Object.entries(val)) {
            sanitizedObj[k] = sanitizeInput(v, k);
        }
        return sanitizedObj;
    }
    return val;
}
let SecuritySanitizerPipe = class SecuritySanitizerPipe {
    transform(value, metadata) {
        return sanitizeInput(value, metadata?.data || '');
    }
};
exports.SecuritySanitizerPipe = SecuritySanitizerPipe;
exports.SecuritySanitizerPipe = SecuritySanitizerPipe = __decorate([
    (0, common_1.Injectable)()
], SecuritySanitizerPipe);
//# sourceMappingURL=security-sanitizer.pipe.js.map
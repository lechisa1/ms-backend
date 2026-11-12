import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
export declare function containsExecutableScript(value: string): boolean;
export declare function containsHtmlOrScript(value: string): boolean;
export declare function sanitizeLongFormText(value: string): string;
export declare function sanitizeInput(val: any, fieldKey?: string): any;
export declare class SecuritySanitizerPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any;
}

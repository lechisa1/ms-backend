import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

/**
 * Long-form narrative fields that should be automatically sanitized (stripping executable scripts)
 * rather than strictly rejected.
 */
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

/**
 * Patterns matching dangerous executable scripts and injection vectors
 */
const SCRIPT_PATTERNS = [
  /<\s*script\b[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, // Full script tags <script>...</script>
  /<\s*script\b[^>]*>/gi,                             // Unclosed <script>
  /<\s*\/\s*script\s*>/gi,                            // Closing </script>
  /javascript\s*:/gi,                                 // javascript: pseudo protocol
  /vbscript\s*:/gi,                                   // vbscript: pseudo protocol
  /data\s*:\s*text\/html/gi,                          // data:text/html protocol
  /\bon[a-z]{3,}\s*=/gi,                              // inline event handlers e.g. onload=, onerror=, onclick=
  /<\s*\/?\s*(iframe|embed|object|applet|meta|link|style|base)\b[^>]*>/gi, // embedding/style tags
  /expression\s*\(/gi,                                // CSS expressions
];

/**
 * Checks if a string contains executable script or event handler vectors
 */
export function containsExecutableScript(value: string): boolean {
  if (typeof value !== 'string') return false;
  return SCRIPT_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(value);
  });
}

/**
 * Checks if a structured field contains HTML/script tags
 */
export function containsHtmlOrScript(value: string): boolean {
  if (typeof value !== 'string') return false;
  if (containsExecutableScript(value)) return true;
  // Check for HTML tag markup in structured single-line fields
  return /<\s*\/?[a-z][^>]*>/i.test(value);
}

/**
 * Strips executable scripts and dangerous tags from long-form text while preserving safe text
 */
export function sanitizeLongFormText(value: string): string {
  if (typeof value !== 'string') return value;
  let sanitized = value;
  for (const pattern of SCRIPT_PATTERNS) {
    pattern.lastIndex = 0;
    sanitized = sanitized.replace(pattern, '');
  }
  return sanitized.trim();
}

/**
 * Recursively inspects and sanitizes all incoming values:
 * - Single-line / structured fields: strictly rejects executable scripts or HTML tags.
 * - Narrative / description fields: automatically strips executable scripts safely.
 */
export function sanitizeInput(val: any, fieldKey: string = ''): any {
  if (val === null || val === undefined) return val;

  if (typeof val === 'string') {
    const lowerKey = fieldKey.toLowerCase();
    const isLongForm = LONG_FORM_FIELDS.has(lowerKey);

    if (isLongForm) {
      return sanitizeLongFormText(val);
    }

    // Passwords can contain special symbols like @ or < but cannot contain executable scripts
    if (
      lowerKey === 'password' ||
      lowerKey === 'currentpassword' ||
      lowerKey === 'newpassword' ||
      lowerKey === 'confirmpassword'
    ) {
      if (containsExecutableScript(val)) {
        throw new BadRequestException('Disallowed executable script pattern detected in password.');
      }
      return val;
    }

    // Structured fields: strict rejection
    if (containsExecutableScript(val) || containsHtmlOrScript(val)) {
      throw new BadRequestException(
        `Input in field '${fieldKey || 'input'}' contains disallowed executable script or HTML tags.`,
      );
    }

    return val;
  }

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeInput(item, fieldKey));
  }

  if (typeof val === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      sanitizedObj[k] = sanitizeInput(v, k);
    }
    return sanitizedObj;
  }

  return val;
}

@Injectable()
export class SecuritySanitizerPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return sanitizeInput(value, metadata?.data || '');
  }
}

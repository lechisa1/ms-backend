"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const bigint_serializer_interceptor_1 = require("./common/interceptors/bigint-serializer.interceptor");
const security_sanitizer_pipe_1 = require("./common/pipes/security-sanitizer.pipe");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.setGlobalPrefix('api');
    const frontendUrl = configService.get('FRONTEND_URL');
    const allowedOrigins = [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
        'http://localhost:3000',
        ...(frontendUrl ? [frontendUrl] : []),
    ];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        exposedHeaders: ['X-XSRF-TOKEN', 'x-xsrf-token'],
    });
    app.useGlobalInterceptors(new bigint_serializer_interceptor_1.BigIntSerializerInterceptor());
    app.useGlobalPipes(new security_sanitizer_pipe_1.SecuritySanitizerPipe(), new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Maintenance Management API')
        .setDescription('Maintenance requests, items, technicians, work logs and approvals')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document);
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    common_1.Logger.log(`Listening on http://localhost:${port}/api`, 'Bootstrap');
    common_1.Logger.log(`Swagger docs on http://localhost:${port}/docs`, 'Bootstrap');
}
void bootstrap();
//# sourceMappingURL=main.js.map
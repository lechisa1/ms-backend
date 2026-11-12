import { CreateUserDto } from './create-user.dto';
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<Omit<CreateUserDto, "password" | "roleIds" | "permissionNames">>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
}
export declare class ResetPasswordDto {
    newPassword: string;
}
export {};

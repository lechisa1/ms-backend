import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class SendNotificationDto {
    userId: string;
    type: string;
    payload: Record<string, unknown>;
}
export declare class QueryNotificationDto extends PaginationDto {
    search?: string;
    unreadOnly?: string;
}

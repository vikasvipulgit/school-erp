import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

export const MIN_ROLE_KEY = 'minRole';
export const MinRole = (role: Role) => SetMetadata(MIN_ROLE_KEY, role);

import { CURRENT_USER_KEY } from './../../utils/constants';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadType } from '../../utils/types';

export const CurrentUser = createParamDecorator(
  (_data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const payload: JwtPayloadType = req[CURRENT_USER_KEY];
    return payload;
  },
);

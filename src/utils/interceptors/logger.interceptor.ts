import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap, map } from "rxjs";

@Injectable()
export class LoggerInterceptor implements NestInterceptor{
    intercept(_context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        console.log("Before Handler");
        
        return next.handle().pipe(map(dataFromRouteHandler=>{
            const {password, ...otherdata} = dataFromRouteHandler
            return {success:"true", data:otherdata}
        }))
    }

}
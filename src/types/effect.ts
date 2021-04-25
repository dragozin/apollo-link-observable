import { Operation } from '@apollo/client';
import { Observable } from 'rxjs';

export interface Effect {
    (operations$: Observable<Operation>): Observable<any>;
}

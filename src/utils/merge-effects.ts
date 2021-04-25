import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Effect } from '../types/effect';

export function mergeEffects(effects: Effect[]): Effect {
    return (operations$) => of(...effects).pipe(mergeMap((effect) => effect(operations$)));
}

import { Subject, Observable } from 'rxjs';
import { Operation } from '@apollo/client';

import { mergeEffects } from '../merge-effects';

describe('mergeEffects utility', () => {
    it('should merge array of effects into one effect', () => {
        const operations$ = new Subject<Operation>().asObservable();
        const firstEffect = jest.fn(
            (operationsFirst$: Observable<Operation>) => operationsFirst$,
        );
        const secondEffect = jest.fn(
            (operationsSecond$: Observable<Operation>) => operationsSecond$,
        );
        const rootEffect = mergeEffects([firstEffect, secondEffect]);
        const rootEffectSubscription = rootEffect(operations$).subscribe();

        expect(firstEffect.mock.calls.length).toBe(1);
        expect(secondEffect.mock.calls.length).toBe(1);
        expect(firstEffect.mock.calls[0][0]).toBe(operations$);
        expect(secondEffect.mock.calls[0][0]).toBe(operations$);
        rootEffectSubscription.unsubscribe();
    });
});

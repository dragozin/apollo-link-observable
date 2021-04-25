import { tap } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Operation, NextLink } from '@apollo/client';

describe('ApolloLinkObservable class', () => {
    afterEach(() => {
        jest.unmock('rxjs');
        jest.resetModules();
    });

    it('should pass an observable stream of operations into the root effect', async () => {
        const rootEffect = (jest.fn(() => ({
            subscribe() {},
        })) as any) as jest.Mock;
        const operationsObservable$ = {};
        const subjectMocked = { asObservable: () => operationsObservable$ };

        function SubjectMocked() {
            return subjectMocked;
        }

        jest.doMock('rxjs', () => ({
            __esModule: true,
            Subject: SubjectMocked,
        }));

        const { ApolloLinkObservable } = await import(
            '../apollo-link-observable'
        );
        const link = new ApolloLinkObservable({ rootEffect });

        expect(link).toBeDefined();
        expect(rootEffect).toBeCalled();
        expect(rootEffect.mock.calls[0][0]).toBe(operationsObservable$);
    });

    it('should subscribe to an observable stream by default', async () => {
        const subscribe = jest.fn();
        const rootEffect = (jest.fn(() => ({
            subscribe,
        })) as any) as jest.Mock;

        const { ApolloLinkObservable } = await import(
            '../apollo-link-observable'
        );
        const link = new ApolloLinkObservable({ rootEffect });

        expect(link).toBeDefined();
        expect(subscribe).toBeCalled();
    });

    it("should't subscribe to the observable stream if the autoSubscribe parameter is false", async () => {
        const subscribe = jest.fn();
        const rootEffect = (jest.fn(() => ({
            subscribe,
        })) as any) as jest.Mock;

        const { ApolloLinkObservable } = await import(
            '../apollo-link-observable'
        );
        const link = new ApolloLinkObservable({
            rootEffect,
            autoSubscribe: false,
        });

        expect(link).toBeDefined();
        expect(subscribe).not.toBeCalled();
    });

    it("should use the 'operations' parameter for the Subject of operations if the last one is set", async () => {
        const rootEffect = (jest.fn(() => ({
            subscribe() {},
        })) as any) as jest.Mock;
        const asObservable = jest.fn();
        const operationsMocked = { asObservable };

        const { ApolloLinkObservable } = await import(
            '../apollo-link-observable'
        );
        const link = new ApolloLinkObservable({
            rootEffect,
            operations: (operationsMocked as any) as Subject<Operation>,
        });

        expect(link).toBeDefined();
        expect(asObservable).toBeCalled();
    });

    it('should subscribe to the observable stream if subscribe method is called', async () => {
        const subscribe = jest.fn();
        const rootEffect = (jest.fn(() => ({
            subscribe,
        })) as any) as jest.Mock;

        const { ApolloLinkObservable } = await import(
            '../apollo-link-observable'
        );
        const link = new ApolloLinkObservable({
            rootEffect,
            autoSubscribe: false,
        });

        link.subscribe();

        expect(link).toBeDefined();
        expect(subscribe).toBeCalled();
    });

    test("The effect's operation$ stream should emit a new operation if it arises", async () => {
        const next = jest.fn();
        const hasDirectives = jest.fn(() => true);
        const rootEffect = (
            operations$: Observable<Operation>,
        ): Observable<any> => operations$.pipe(tap(next));
        const operationMock: Operation = {} as Operation;
        jest.doMock('@apollo/client/utilities', () => {
            const originalModule = jest.requireActual(
                '@apollo/client/utilities',
            );

            return {
                ...originalModule,
                hasDirectives,
            };
        });
        const { ApolloLinkObservable } = await import(
            '../apollo-link-observable'
        );
        const link = new ApolloLinkObservable({
            rootEffect,
            autoSubscribe: false,
        });
        const subscription = link.subscribe();
        link.request(operationMock, ((() => {}) as any) as NextLink);

        expect(link).toBeDefined();
        expect(hasDirectives).toBeCalled();
        expect(next).toBeCalled();
        expect(next.mock.calls[0][0]).toBe(operationMock);

        subscription.unsubscribe();
    });

    test("The effect's operation$ stream shouldn't emit a new operation if it doesn't have the effect directive", async () => {
        const next = jest.fn();
        const hasDirectives = jest.fn(() => false);
        const rootEffect = (
            operations$: Observable<Operation>,
        ): Observable<any> => operations$.pipe(tap(next));
        const operationMock: Operation = {} as Operation;
        jest.doMock('@apollo/client/utilities', () => {
            const originalModule = jest.requireActual(
                '@apollo/client/utilities',
            );

            return {
                ...originalModule,
                hasDirectives,
            };
        });
        const { ApolloLinkObservable } = await import(
            '../apollo-link-observable'
        );
        const link = new ApolloLinkObservable({
            rootEffect,
            autoSubscribe: false,
        });
        const subscription = link.subscribe();
        link.request(operationMock, ((() => {}) as any) as NextLink);

        expect(link).toBeDefined();
        expect(hasDirectives).toBeCalled();
        expect(next).not.toBeCalled();

        subscription.unsubscribe();
    });
});

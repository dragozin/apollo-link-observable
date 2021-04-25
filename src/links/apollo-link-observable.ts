import { ApolloLink, Operation, NextLink } from '@apollo/client';
import { hasDirectives } from '@apollo/client/utilities';
import { Subject, Observable } from 'rxjs';
import { Effect } from '../types/effect';

const DEFAULT_DIRECTIVE_NAME = 'effect';

export class ApolloLinkObservable extends ApolloLink {
    private rootEffect$: Observable<any>;

    private directiveName: string | null;

    private operations: Subject<Operation>;

    public subscribe: Observable<any>['subscribe'];

    constructor({
        rootEffect,
        operations = new Subject(),
        autoSubscribe = true,
        directiveName = DEFAULT_DIRECTIVE_NAME,
    }: {
        rootEffect: Effect;
        operations?: Subject<Operation>;
        autoSubscribe?: boolean;
        directiveName?: string | null;
    }) {
        super();
        this.operations = operations;
        this.directiveName = directiveName;
        this.rootEffect$ = rootEffect(operations.asObservable());
        this.subscribe = this.rootEffect$.subscribe.bind(this.rootEffect$);

        if (autoSubscribe) {
            this.subscribe();
        }
    }

    request(operation: Operation, forward: NextLink): ReturnType<NextLink> {
        const { query } = operation;

        if (!this.directiveName || hasDirectives([this.directiveName], query)) {
            this.operations.next(operation);
        }

        return forward(operation);
    }
}

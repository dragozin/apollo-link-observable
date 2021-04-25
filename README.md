# apollo-link-observable

Link that allows you to make side effects of graphql queries using [RxJS](http://github.com/ReactiveX/RxJS)

## Motivation

1. Organization of application side effects such as logging, accessing the browser cache, recording analytics events etc.
1. A part of the application with longer lifecycle than a component's one.
1. Creating a complex application business logic.
1. Performing REST queries as a reaction to the graphql query.
1. Local state changes that are triggered by graphql queries.

### Installation

using npm

```
npm install apollo-link-observable
```

or using yarn

```
yarn add apollo-link-observable
```

### Usage

1. Creation of the "effect" function

    Effect - is a function, which takes a stream of operations and returns a modified one.

    Example of the effect which logs names of operations

```typescript
import { tap } from 'rxjs/operators';
import { Effect } from 'apollo-link-observable';

export const logEffect: Effect = (operations$) =>
    operations$.pipe(tap((operation) => console.log(operation.operationName)));
```

2. Сreate a link

    To create a link you have to provide your effect function as the `rootEffect` property of the ApolloLinkObservable constructor's configuration object.

```typescript
import { ApolloLinkObservable } from 'apollo-link-observable';
import { logEffect } from './log-effect';

const link = new ApolloLinkObservable({ rootEffect: logEffect });
```

2. Merge effects

    If you have more than one effect you can merge them into the single root effect using `mergeEffects` helper from the `apollo-link-observable` package.

```typescript
const rootEffect = mergeEffects([myLogEffect, myAnalyticsEffect]);
const link = new ApolloLinkObservable({ rootEffect });
```

3. Lazy loading effects

    If you need asynchronous loading for your effects you can do this like this:

```typescript
import { Subject, of } from 'rxjs';
import { mergeMap, mergeAll } from 'rxjs/operators';
import { Effect } from 'apollo-link-observable';
import { cacheEffect, logEffect } from './effects';

const lazyLoadEffects = new Subject<Effect>();

const rootEffect: Effect = (operations$) =>
    of(of(logEffect, cacheEffect), lazyLoadEffects.asObservable()).pipe(
        mergeAll(),
        mergeMap((effect) => effect(operations$)),
    );

// assynchronous loading of an effect
import { lazyEffect } from './lazy-effect';
lazyLoadEffects.next(lazyEffect);
```

4. Filtering operations by a directive

    By default you can create side effects of operations, which have `effect` directive. For example,

```typescript
const [myMutation] = useMutation(
    gql`
        mutation MyMutation($data: String!) {
            myMutation(data: $data) @effect
        }
    `,
);
```

You can change this behaviour. To do this provide a new directive name as the `directiveName` property of the ApolloLinkObservable constructor's configuration object.

```typescript
const link = new ApolloLinkObservable({
    rootEffect,
    directiveName: 'myDirective',
});
```

Pass to the directiveName `null` if it's necessary to turn off the operation filtration.

```typescript
const link = new ApolloLinkObservable({
    rootEffect,
    directiveName: null,
});
```

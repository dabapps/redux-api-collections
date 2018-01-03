# Redux API Collections
[![Build Status](https://travis-ci.com/dabapps/redux-api-collections.svg?token=Vjwq9pDHXxGNhnyuktQ5&branch=master)](https://travis-ci.com/dabapps/redux-api-collections)

Standardised, type-safe ways of interacting with DRF-style APIs.

Redux API Collections aims to simplify and standardise the way in which we access Django Rest Framework endpoints when writing Redux applications in Typescript. It offers reducers for both collection endpoints and individual item endpoints, as well as the necessary tools to shunt data into them.

## Installation
Install via NPM:

```
npm install @dabapps/chadmin --save --save-exact
```

To install you will need the company npm token set in your env `NPM_TOKEN=` and also add an `./npmrc` file (the same as the one included here), to be able to authenticate with NPM Private Repos.

## Getting Started
This project requires use of Redux-Thunk to correctly dispatch actions.  Collection endpoints must follow Django Rest Framework's pagination logic.  Item endpoints should return a single item.

To begin with, you will need to provide two interfaces that map given paths to a type or interface that represents a well-formed instance of an item being returned from the server.  You will need one collection for collection paths, and one for item paths. If you are lucky, these may be the same interface.  These paths are expected to match with your server's `/api/[endpoint]/` url and `/api/[endpoint]/[id]/` respectively.

```typescript
type User = Readonly<{
  id: string,
  name: string
}>;

interface Collections {
  users: User  // This is /api/users/ on the server
}

interface Items {
  users: User  // This is /api/users/[id]/ on the server
}
```

With these two (or one) interfaces defined, you will need to attach them to your store. This is as simple as including the following code:

```typescript
interface Store {
  collections: CollectionStore<Collections>,
  items: ItemStore<Items>
}
```
You can, in theory, mount the stores elsewhere, but this is not recommended.

The next step is providing a mapping between paths and functions that will produce instances of our objects from the server. Typically, you'll want to use Immutable's Record type or our own SimpleRecord, but if you trust the server to always give back fully realised objects, the identity function will suffice.

```typescript
const collectionToRecordMapping = {
  users: (user: User) => user
}

const itemToRecordMapping = {
  users: (user: User) => user
}
```

Now we have mappings, plus interfaces, we can bring it all together.  You are likely to want to also mount the Responses reducer, as this gives visibility to which endpoints are currently in use.

```typescript
import { Collections } from 'redux-api-collections';
import { responsesReducer } from 'redux-api-collections/dist/requests';

const collections = Collections<Collections, Items>(collectionToRecordMapping, itemToRecordMapping);

// elsewhere
combineReducers({
  collections: collections.reducers.collectionsReducer,
  items: collections.reducers.itemsReducer,

  responses: responsesReducer,
});
```

The Collections object gives you access to type-safe helper functions for requesting data.

For example, we want to get a specific collection endpoint. We can call `collections.actions.getCollection` to request data from the server.

```typescript
const action = collections.actions.getCollection('users', options);
dispatch(action);

// Later

getCollectionByName(store.collections, 'users');
getCollectionResultsByName(store.collections, 'users');
```

Many functions can also be namespaced by a `subgroup` field - this will allow you to request the same endpoint from multiple places without overwriting their results.

## Subpaths

There are often situations where you want to have collections or items at a path with some form of ID in the middle of it. This can be done:

```typescript
interface Collections {
  'users/<user_id>/other-users': User  // This is /api/users/<user_id>/other_users/ on the server
}

interface Items {
  'users/<user_id>/other-users': User  // This is /api/users/<user_id>/other_users/[id]/ on the server
}
```

With these two paths, we need to be able to specify a separate `user_id` for it to make sense. We can construct helper functions for working with this:

```typescript
const collectionSubpath = collections.collectionAtSubpath('users/<user_id>/other-users', userId);
const itemSubpath = collections.itemAtSubpath('users/<user_id>/other-users', userId);
```
You will need to call these methods with an argument for every item in angle brackets - this currently cannot be statically enforced, though.

The two resulting structures contain pre-parameterized sets of action creators, as well as accessor functions.

```typescript
collectionSubpath.actions.getCollection(options);  // Contains a pre-bound action for each of the normal collection actions
collectionSubpath.getSubpathCollection(store);  // Our collection object
collectionSubpath.getSubpathCollectionResults(store);  // Just the items

itemSubpath.actions.getItem('12345');
itemSubpath.getSubpathItem(store);
```

## I'm stuck!

### Help, I want to use Immutable collections!

We've got you covered.  When initializing Collections, pass `true` as the third argument to automatically generate Immutable List based collections, which can then be retrieved via `getImmutableCollectionResultsByName`

```typescript
const collections = Collections<Collections, Items>(collectionToRecordMapping, itemToRecordMapping, true);
```

However, we generate fresh `List`s with every change, as the internal APIs between `List`s and `ReadonlyArray`s are too dissimilar for the code to be generic across.  This feature exists mostly for backwards compatibility with projects that are currently using Immutable.

### Help, my API isn't mounted at /api/

You can parameterize the Collections object with different base URLs, for those odd cases where your API is different from the others we use.


```typescript
import { Collections } from 'redux-api-collections';
const collections = Collections<Collections, Items>(collectionToRecordMapping, itemToRecordMapping, false, '/another-base-url/');
```

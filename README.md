# Redux API Collections
Standardised, type-safe ways of interacting with DRF-style APIs.

Redux API Collections aims to simplify and standardise the way in which we access Django Rest Framework endpoints when writing Redux applications in Typescript. It offers reducers for both collection endpoints and individual item endpoints, as well as the necessary tools to shunt data into them.

## Getting Started

To begin with, you will need to provide two interfaces that map given paths to a type or interface that represents a well-formed instance of an item being returned from the server.  You will need one collection for collection paths, and one for item paths. If you are lucky, these may be the same interface.  These paths are expected to match with your server's `/api/[endpoint]/` url and `/api/[endpoint]/[id]/` respectively.

```typescript
type User = Readonly<{
  id: string,
  name: string
}>;

interface ICollections {
  users: User  // This is /api/users/ on the server
}

interface IItems {
  users: User  // This is /api/users/[id]/ on the server
}
```

With these two (or one) interfaces defined, you will need to attach them to your store. This is as simple as including the following code:

```typescript
interface IStore {
  collections: TCollectionStore<ICollections>,
  items: TItemStore<IItems>
}
```
You can, in theory, mount the stores elsewhere, but this is not recommended.

The next step is providing a mapping between paths and functions that will produce instances of our objects from the server. Typically, you'll want to use Immutable's Record type or our own SimpleRecord, but if you trust the server to always give back fully realised objects, the identity function will suffice.

```typescript
const collectionToRecordMapping = {
  users: (user: IUser) => user
}

const itemToRecordMapping = {
  users: (user: IUser) => user
}
```

Now we have mappings, plus interfaces, we can bring it all together.

```typescript
const collections = Collections<ICollections, IItems>(collectionToRecordMapping, itemToRecordMapping);

// elsewhere
combineReducers({
  collections: collections.reducers.collectionsReducer,
  items: collections.reducers.itemsReducer
});
```

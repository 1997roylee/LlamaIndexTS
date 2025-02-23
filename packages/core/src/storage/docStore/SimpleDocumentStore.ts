import _ from "lodash";
import { defaultFS, path } from "../../env";
import { GenericFileSystem } from "../FileSystem";
import {
  DEFAULT_DOC_STORE_PERSIST_FILENAME,
  DEFAULT_NAMESPACE,
  DEFAULT_PERSIST_DIR,
} from "../constants";
import { SimpleKVStore } from "../kvStore/SimpleKVStore";
import { KVDocumentStore } from "./KVDocumentStore";

type SaveDict = Record<string, any>;

export class SimpleDocumentStore extends KVDocumentStore {
  private kvStore: SimpleKVStore;

  constructor(kvStore?: SimpleKVStore, namespace?: string) {
    kvStore = kvStore || new SimpleKVStore();
    namespace = namespace || DEFAULT_NAMESPACE;
    super(kvStore, namespace);
    this.kvStore = kvStore;
  }

  static async fromPersistDir(
    persistDir: string = DEFAULT_PERSIST_DIR,
    namespace?: string,
    fsModule?: GenericFileSystem,
  ): Promise<SimpleDocumentStore> {
    const persistPath = path.join(
      persistDir,
      DEFAULT_DOC_STORE_PERSIST_FILENAME,
    );
    return await SimpleDocumentStore.fromPersistPath(
      persistPath,
      namespace,
      fsModule,
    );
  }

  static async fromPersistPath(
    persistPath: string,
    namespace?: string,
    fs?: GenericFileSystem,
  ): Promise<SimpleDocumentStore> {
    fs = fs || defaultFS;
    const simpleKVStore = await SimpleKVStore.fromPersistPath(persistPath, fs);
    return new SimpleDocumentStore(simpleKVStore, namespace);
  }

  async persist(
    persistPath: string = path.join(
      DEFAULT_PERSIST_DIR,
      DEFAULT_DOC_STORE_PERSIST_FILENAME,
    ),
    fs?: GenericFileSystem,
  ): Promise<void> {
    fs = fs || DEFAULT_FS;
    if (_.isObject(this.kvStore) && this.kvStore instanceof SimpleKVStore) {
      await this.kvStore.persist(persistPath, fs);
    }
  }

  static fromDict(saveDict: SaveDict, namespace?: string): SimpleDocumentStore {
    const simpleKVStore = SimpleKVStore.fromDict(saveDict);
    return new SimpleDocumentStore(simpleKVStore, namespace);
  }

  toDict(): SaveDict {
    if (_.isObject(this.kvStore) && this.kvStore instanceof SimpleKVStore) {
      return this.kvStore.toDict();
    }
    // If the kvstore is not a SimpleKVStore, you might want to throw an error or return a default value.
    throw new Error("KVStore is not a SimpleKVStore");
  }
}

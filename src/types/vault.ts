export enum ItemType {
    text = 'text',
    file = 'file'
  }
  
  export type VaultItem = {
    id: number;
    name: string;
    type: ItemType;
    dateAdded: Date;
    size?: string | null;
  };
import { MCStructure } from '../lib/nbt/types';

export interface ErrorHandler {
  onError: (message: string) => void;
}

export interface StructureLoadHandler {
  onStructureLoad: (structure: MCStructure) => void;
}

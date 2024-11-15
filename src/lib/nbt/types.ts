export interface MCStructure {
  size: {
    value: {
      value: number[];
    };
  };
  structure: {
    value: {
      block_indices: {
        value: {
          value: {
            value: number[];
          }[];
        };
      };
      palette: {
        value: {
          default: {
            value: {
              block_palette: {
                value: {
                  value: BlockDefinition[];
                };
              };
            };
          };
        };
      };
    };
  };
}

export interface BlockDefinition {
  name: {
    value: string;
  };
  states: {
    value: Record<string, {
      value: unknown;
    }>;
  };
  version: {
    value: number;
  };
}

export interface EntityData {
  identifier: {
    type: string;
    value: string;
  };
  Position: {
    type: string;
    value: {
      type: string;
      value: number[];
    };
  };
  // 他のエンティティプロパティ
}

export interface BlockData {
  block_entity_data?: {
    type: string;
    value: Record<string, unknown>;
  };
}

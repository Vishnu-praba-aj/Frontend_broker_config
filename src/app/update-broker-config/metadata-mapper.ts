export const metadataKeyMap: Record<string, string> = {
  start_index_nbr: 'Start Index',
  end_index_nbr: 'End Index',
  row_adder_cnt: 'Row Adder Count',
  col_adder_cnt: 'Column Adder Count',
  param_ref_delim_txt: 'Param Delimiter',
  param_value_pos_cd: 'Param Value Posn Code',
  unit_price_pct_ind: 'Unit Price Pct Indicator',
  param_nm_occur_ind: 'Param Occur Indicator',
  date_format_cd: 'Date Format Code',
  decimal_separator_cd: 'Decimal Separator Code',
  param_def_value_txt: 'Param Default Value',
  derivation_col: 'Derivation Column',
  operations_seq: 'Operations Sequence',
  param_val_fn_txt: 'Param Value Function',
};

export function mapMetadataKeys(
  metadata: Record<string, any>,
  keyMap: Record<string, string> = metadataKeyMap
): Record<string, any> {
  const newMetadata: Record<string, any> = {};
  for (const key in metadata) {
    const newKey = keyMap[key] || key;
    newMetadata[newKey] = metadata[key];
  }
  return newMetadata;
}

export const reverseMetadataKeyMap: Record<string, string> = Object.entries(metadataKeyMap).reduce(
  (acc, [backendKey, label]) => {
    acc[label] = backendKey;
    return acc;
  },
  {} as Record<string, string>
);

export function restoreMetadataKeys(
  metadata: Record<string, any>,
  keyMap: Record<string, string> = reverseMetadataKeyMap
): Record<string, any> {
  const restoredMetadata: Record<string, any> = {};
  for (const key in metadata) {
    const originalKey = keyMap[key] || key;
    restoredMetadata[originalKey] = metadata[key];
  }
  return restoredMetadata;
}

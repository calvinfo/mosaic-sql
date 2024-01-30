/**
 * Class representing a table and/or column reference.
 */
export class Ref {
  table?: string;
  column?: string;
  label?: string;

  /**
   * Create a new Ref instance.
   * @param {string|Ref|null} table The table name.
   * @param {string|null} column The column name.
   */
  constructor(table?: string | Ref, column?: string) {
    if (table) this.table = String(table);
    if (column) this.column = column;
  }

  /**
   * Get the list of referenced columns. Either a single element array
   * if column is non-null, otherwise an empty array.
   */
  get columns() {
    return this.column ? [this.column] : [];
  }

  /**
   * Generate a SQL string for this reference.
   * @returns {string} The SQL string.
   */
  toString() {
    const { table, column } = this;
    if (column) {
      const col = column.startsWith("*") ? column : `"${column}"`;
      return `${table ? `${quoteTableName(table)}.` : ""}${col}`;
    } else {
      return table ? quoteTableName(table) : "NULL";
    }
  }
}

/**
 * Quote a table name. For example, `foo.bar` becomes `"foo"."bar".
 * @param {string} table the name of the table which may contain a database reference
 * @returns The quoted table name.
 */
function quoteTableName(table: string) {
  const pieces = table.split(".");
  return pieces.map((p) => `"${p}"`).join(".");
}

/**
 * Test is a reference refers to a given column name.
 * @param {*} ref The reference to test.
 * @param {string} name The column name to check for.
 * @returns {boolean} True if ref is a Ref instance that refers to
 *  the given column name. False otherwise.
 */
export function isColumnRefFor(ref: any, name: string): boolean {
  return ref instanceof Ref && ref.column === name;
}

/**
 * Interpret a value, defaulting to a column reference.
 * @param {*} value The value to interpret. If string-typed,
 *  a new column reference will be returned.
 * @returns {*} A column reference or the input value.
 */
export function asColumn(value: any): any {
  return typeof value === "string" ? column(value) : value;
}

/**
 * Interpret a value, defaulting to a table (relation) reference.
 * @param {*} value The value to interpret. If string-typed,
 *  a new table (relation) reference will be returned.
 * @returns {*} A table reference or the input value.
 */
export function asRelation(value: string | Ref): Ref {
  return typeof value === "string" ? relation(value) : value;
}

/**
 * Create a table (relation) reference.
 * @param {string} name The table (relation) name.
 * @returns {Ref} The generated table reference.
 */
export function relation(name: string): Ref {
  return new Ref(name);
}

/**
 * Create a column reference.
 * @param {string} [table] The table name (optional).
 * @param {string} column The column name.
 * @returns {Ref} The generated column reference.
 */
export function column(table: string, column: string): Ref;
export function column(column: string): Ref;
export function column(tableOrColumn: string, column?: string): Ref {
  if (typeof column === "string") {
    // Called with two arguments: table and column
    return new Ref(tableOrColumn, column);
  } else {
    // Called with one argument: column
    return new Ref(undefined, tableOrColumn);
  }
}

/**
 * Create a reference to all columns in a table (relation).
 * @param {string} table The table name.
 * @returns {Ref} The generated reference.
 */
export function all(table: string): Ref {
  return new Ref(table, "*");
}

/**
 * Base Target Format Adapter
 */

export class BaseAdapter {
  constructor(name) {
    this.name = name;
  }

  /**
   * Adapts a CanonicalRequirementSpec into target dialect output.
   * @param {object} spec - CanonicalRequirementSpec
   * @param {object} options
   * @returns {object} { promptA, promptB, nativeCode, schemaJson }
   */
  adapt(spec, options = {}) {
    throw new Error(`adapt() must be implemented by subclass ${this.constructor.name}`);
  }
}

export default BaseAdapter;

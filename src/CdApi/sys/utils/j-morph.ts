/**
 * Author G. Oremo
 * 3rd April 2025
 *
 * JMorph - JSON Modification Utility
 *
 * This class provides a universal way to apply structured modification instructions to JSON data.
 * It supports the following operations:
 * - Create: Adds new data to a JSON structure.
 * - Read: Retrieves data based on a given path.
 * - Update: Modifies existing data.
 * - Delete: Removes data.
 *
 * The path field in JUpdateInstruction defines where the modification should occur.
 * Special rules apply for handling arrays:
 * - If modifying an array, a key must be specified using the ["<key>"] notation.
 * - If no key is provided, it is treated as a replacement request for the entire array.
 * - If an update operation is performed on an array without a key, an error will be thrown.
 *
 * Example usage:
 * const jsonData = { <JSON data as provided > };
 * const jsonUpdate: JUpdateInstruction[] = [ <JSON updates as provided> ];
 * const updatedData = JMorph.applyUpdates(jsonData, jsonUpdate);
 * console.log(updatedData);
 */

export interface JUpdateInstruction {
  path: any[];
  value: any;
  action: "create" | "read" | "update" | "delete";
}

export class JMorph {
  /**
   * Applies a list of update instructions to the given JSON data.
   * @param jsonData - The JSON object to be modified.
   * @param jsonUpdate - An array of update instructions.
   * @returns The modified JSON data.
   */
  static applyUpdates(jsonData: any, jsonUpdate: JUpdateInstruction[]): any {
    for (const instruction of jsonUpdate) {
      this.applyUpdate(jsonData, instruction);
    }
    return jsonData;
  }

  /**
   * Applies a single update instruction to the JSON data.
   * @param jsonData - The JSON object to be modified.
   * @param instruction - The update instruction.
   */
  // private static applyUpdate(jsonData: any, instruction: JUpdateInstruction): void {
  //     console.log("JMorph::applyUpdate()/01")
  //     console.log("JMorph::applyUpdate()/jsonData:", JSON.stringify(jsonData))
  //     console.log("JMorph::applyUpdate()/instruction:", JSON.stringify(instruction))
  //     const { path, value, action } = instruction;
  //     console.log("JMorph::applyUpdate()/02")
  //     let target = jsonData;

  //     for (let i = 0; i < path.length - 1; i++) {
  //         console.log(`JMorph::applyUpdate()/03/${i}`)
  //         if (Array.isArray(path[i + 1]) && typeof path[i + 1][0] === 'string') {
  //             console.log(`JMorph::applyUpdate()/04/${i}`)
  //             const key = path[i + 1][0];
  //             console.log(`JMorph::applyUpdate()/05/${i}`)
  //             target = target[path[i]];
  //             console.log(`JMorph::applyUpdate()/06/${i}`)
  //             if (Array.isArray(target)) {
  //                 console.log(`JMorph::applyUpdate()/07/${i}`)
  //                 target = target.find((item: any) => item[key] === value[key]);
  //             }
  //             console.log(`JMorph::applyUpdate()/08/${i}`)
  //             i++; // Skip the array key
  //         } else {
  //             target = target[path[i]];
  //             console.log(`JMorph::applyUpdate()/08/${i}`)
  //         }
  //     }

  //     const lastKey = path[path.length - 1];
  //     console.log(`JMorph::applyUpdate()/09`)
  //     console.log(`JMorph::applyUpdate()/target:${JSON.stringify(target)}`)
  //     console.log(`JMorph::applyUpdate()/lastKey:${lastKey}`)
  //     if (Array.isArray(target[lastKey]) && !Array.isArray(lastKey)) {
  //         console.log(`JMorph::applyUpdate()/10`)
  //         throw new Error(`Update operation requires a key for array modifications at path: ${path.join('.')}`);
  //     }
  //     console.log(`JMorph::applyUpdate()/11`)
  //     if (Array.isArray(lastKey) && typeof lastKey[0] === 'string') {
  //         console.log(`JMorph::applyUpdate()/12`)
  //         this.modifyArray(target, lastKey[0], value, action);
  //         console.log(`JMorph::applyUpdate()/13`)
  //     } else {
  //         console.log(`JMorph::applyUpdate()/14`)
  //         this.modifyObject(target, lastKey, value, action);
  //     }
  //     console.log("JMorph::applyUpdate()/target:", JSON.stringify(target))
  // }

  private static applyUpdate(
    jsonData: any,
    instruction: JUpdateInstruction
  ): void {
    console.log("JMorph::applyUpdate()/01");
    console.log("JMorph::applyUpdate()/jsonData:", JSON.stringify(jsonData));
    console.log(
      "JMorph::applyUpdate()/instruction:",
      JSON.stringify(instruction)
    );

    const { path, value, action } = instruction;
    console.log("JMorph::applyUpdate()/02");

    let target = jsonData;

    for (let i = 0; i < path.length - 1; i++) {
      console.log(`JMorph::applyUpdate()/03/${i}`);
      let key = path[i];

      if (Array.isArray(key)) {
        console.log(
          `JMorph::applyUpdate()/Error: Array Detected at ${i}:`,
          key
        );
        throw new Error(
          `Invalid path at ${i}: Arrays cannot be used as keys directly.`
        );
      }

      if (!(key in target)) {
        console.log(
          `JMorph::applyUpdate()/Key missing: Creating ${key} at level ${i}`
        );
        target[key] = typeof path[i + 1] === "number" ? [] : {};
      }

      target = target[key]; // Move deeper into the object

      if (target === undefined) {
        console.log(`JMorph::applyUpdate()/Undefined target at level ${i}`);
        throw new Error(
          `Path error: ${key} does not exist in the provided JSON structure.`
        );
      }
    }

    const lastKey = path[path.length - 1];
    console.log("JMorph::applyUpdate()/target:", target);
    console.log("JMorph::applyUpdate()/lastKey:", lastKey);

    if (Array.isArray(target) && !Array.isArray(lastKey)) {
      console.log(
        "JMorph::applyUpdate()/Error: Attempting to modify an array without key reference"
      );
      throw new Error(
        `Cannot update array at '${path.join(
          "."
        )}' without specifying a unique identifier.`
      );
    }

    // Delegate actions to separate methods
    switch (action) {
      case "create":
        JMorph.createEntry(target, lastKey, value);
        break;
      case "update":
        JMorph.updateEntry(target, lastKey, value);
        break;
      case "delete":
        JMorph.deleteEntry(target, lastKey);
        break;
      default:
        JMorph.createEntry(target, lastKey, value);
    }

    console.log("JMorph::applyUpdate()/Completed");
    console.log("JMorph::applyUpdate()/target2:", target);
  }

  private static createEntry(
    target: any,
    key: string | number,
    value: any
  ): void {
    console.log(`JMorph::createEntry()/Creating new data at ${key}`);

    if (Array.isArray(target)) {
      // Ensure the value contains a valid unique identifier
      const keyField = Object.keys(value)[0]; // Example: "coopId"
      if (!(keyField in value)) {
        console.log(
          `JMorph::createEntry()/Error: Key '${keyField}' not found in value.`
        );
        throw new Error(`Missing unique key in the object.`);
      }

      const keyValue = value[keyField];

      // Use .find() to check if an entry with the same keyField value already exists
      const alreadyExists = target.some(
        (item: any) => item[keyField] === keyValue
      );

      if (alreadyExists) {
        console.warn(
          `JMorph::createEntry()/Error: Entry with ${keyField}=${keyValue} already exists.`
        );
        // throw new Error(
        //   `Duplicate entry: ${keyField}=${keyValue} already exists.`
        // );
      }

      // Push the new object directly into the array
      target.push(value);
      console.log(
        `JMorph::createEntry()/Success: Entry added.`,
        JSON.stringify(target)
      );
    } else {
      console.log(`JMorph::createEntry()/Error: Target is not an array.`);
      throw new Error(`Target is not an array, cannot add a new entry.`);
    }
  }

  private static updateEntry(target: any, key: string, value: any): void {
    console.log(`JMorph::updateEntry()/Updating data at ${key}`);
    target[key] = value;
  }

  private static deleteEntry(target: any, key: string): void {
    console.log(`JMorph::deleteEntry()/Deleting data at ${key}`);
    delete target[key];
  }

  /**
   * Handles modifications to an array field in the JSON structure.
   * @param target - The target array.
   * @param key - The unique key to identify array items.
   * @param value - The new value to be applied.
   * @param action - The type of modification: create, update, delete, or read.
   */
  private static modifyArray(
    target: any[],
    key: string,
    value: any,
    action: string
  ): void {
    if (!Array.isArray(target)) return;

    switch (action) {
      case "create":
        target.push(value);
        break;
      case "update":
        const index = target.findIndex((item) => item[key] === value[key]);
        if (index !== -1) {
          target[index] = value;
        }
        break;
      case "delete":
        target = target.filter((item) => item[key] !== value[key]);
        break;
      case "read":
        console.log(target.find((item) => item[key] === value[key]));
        break;
    }
  }

  /**
   * Handles modifications to an object field in the JSON structure.
   * @param target - The target object.
   * @param key - The key of the field to be modified.
   * @param value - The new value to be applied.
   * @param action - The type of modification: create, update, delete, or read.
   */
  private static modifyObject(
    target: any,
    key: string,
    value: any,
    action: string
  ): void {
    switch (action) {
      case "create":
      case "update":
        target[key] = value;
        break;
      case "delete":
        delete target[key];
        break;
      case "read":
        console.log(target[key]);
        break;
    }
  }
}

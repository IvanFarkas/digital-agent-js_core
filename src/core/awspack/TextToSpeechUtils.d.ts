import { Utils } from '@core/Utils';

/**
 * A collection of useful text-to-speech functions.
 *
 * @hideconstructor
 */
export class TextToSpeechUtils {
  /**
   * Returns a new string with SSML marks inserted based on matches between the input string and the input map. The word matches are case-insensitive. Words within existing SSML tags will not be affected. Input text will be surrounded by <speak></speak> tags if needed.
   *
   * @param {string} text - Input string.
   * @param {object} map - Input object that maps mark keys to arrays of words. Example:
   *
   *  {
   *    'mark:sad' : ['sad', 'blue', 'down'],
   *    'mark:happy' : ['joy', 'glad', 'great'],
   *    'mark:no' : ['no', 'nah', 'nay', 'sure']
   *  }
   * @param {string[]} [randomMarks = []] - If there are sentences that don't match any words from the map object, marks from this array will be randomly chosen and inserted.
   *
   * @returns {string} - Updated input string.
   */
  static autoGenerateSSMLMarks(text: string, map: any, randomMarks: string[] = []): string;

  /**
   * Returns a new string with a random SSML mark inserted at each sentence that does not already contain an SSML mark.
   *
   * @param {string} text - Input string.
   * @param {string[]} marks - Any array of random SSML marks to choose from when modifying the text.
   *
   * @returns {string}
   */
  static addMarksToUnmarkedSentences(text: string, marks?: string[]): string;

  /**
   * Generate a version of given text that is enclosed by Polly ssml speak tags.
   *
   * @param {string} text - The text to validate.
   *
   * @returns {string} - Updated input string.
   */
  static validateText(text: string): string;

  /**
   * Parse an input string and insert SSML marks based on word matches in a map.
   *
   * @private
   *
   * @param {string} text - Input string.
   * @param {Array.<number>} [indices = []] - An array of indices in the text input where random marks should be inserted.
   * @param {string[]} [marks = []] - An array of mark strings to choose from when inserting random marks.
   *
   * @returns {string} - Updated input string.
   */
  static _insertRandomMarksAt(text: string, indices: number[] | null = [], marks: string[] | null = []): string;

  /**
   * Parses a string of text and returns an array containing the indices of the last character in a sentence that is not in the following list: ('.', '?', '!')
   *
   * @private
   *
   * @param {string} text - Text to process for end of sentence indices.
   *
   * @returns {Array.<number>} - Array of end of sentence indices.
   */
  static _getSentenceEnds(text: string): number[];

  /**
   * Parse an input string and insert SSML marks based on word matches in a map.
   *
   * @private
   *
   * @param {string} text - Input string.
   * @param {Map} map - Mapping of words to mark values that will be inserted as the value for a mark's 'name' attribute.
   * @param {Array} duplicatesToCheck - A list of mark values to check for duplicate against the first word
   *
   * @returns {string} - Updated input string.
   */
  static _insertMarks(text: string, map: any, duplicatesToCheck: any): string;

  /**
   * Processes an input object for mapping an array of words to specific mark keys. Converts the input map into a Map with a more efficient format for performing mark injection.
   *
   * @private
   *
   * @param {object} map - Input object that maps mark keys to arrays of words.
   *
   * @returns {Map<any, any>} - Map for internal use.
   */
  static _processInputMap(map: object): Map<any, any>;
}

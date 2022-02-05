/**
 * A collection of useful math functions.
 *
 * @hideconstructor
 */
export declare class MathUtils {
  /**
   * Convert the given angle from radians to degrees.
   *
   * @param {number} radians - Angle in radians.
   *
   * @returns {number} - Angle in degrees.
   */
  static toDegrees(radians: number): number;

  /**
   * Convert the given angle from degrees to radians.
   *
   * @param {number} degrees - Angle in degrees.
   *
   * @returns {number} - Angle in radians.
   */
  static toRadians(degrees: number): number;

  /**
   * Linearly interpolate between two values.
   *
   * @param {number} from - Start value.
   * @param {number} to - Target value.
   * @param {number} factor - 0-1 amount to interpolate between from and to.
   *
   * @returns {number}
   */
  static lerp(from: number, to: number, factor: number): number;

  /**
   * Clamp a number between 2 values.
   *
   * @param {number} value - Value to clamp.
   * @param {number} [min=0] - Minumum value.
   * @param {number} [max=1] - Maximum value.
   *
   * @returns {number}
   */
  static clamp(value: number, min: number = 0, max: number = 1): number;

  /**
   * Calculates the closest point on a given 2D line segement from a given 2D point.
   *
   * @param {number[]} a - First point on line segment.
   * @param {number[]} b - Second point on line segment.
   * @param {number[]} p - 2D point.
   *
   * @returns {number[]}
   */
  static closestPointOnLine(a: number[], b: number[], p: number[]): number[];

  /**
   * Get the distance squared for two 2D points.
   * @param {number[]} a - 2D point.
   * @param {number[]} b - 2D point.
   *
   * @returns {number}
   */
  static distanceSquared(a: number[], b: number[]): number;

  /**
   * Triangulates a set of 2D points using an implementation of the Bowyer-Watson incremental Delaunay triangulation.
   *
   * @param {number[][]} vertices - Array of 2D points.
   *
   * @returns {number[][]} - Array of triangle indices.
   */
  static getDelaunayTriangulation(vertices: number[][]): number[][];

  /**
   * Determines if a given 2D point is within the cicrumcircle defined by three 2D points.
   * The triangle points must be in counter-clockwise order a -> b -> c.
   * Cicrumcircle - https://www.mathopenref.com/trianglecircumcircle.html
   *
   * @param {number[]} a - First triangle point.
   * @param {number[]} b - Second triangle point.
   * @param {number[]} c - Third triangle point.
   * @param {number[]} p - 2D point.
   *
   * @returns {boolean}
   */
  static isPointInCircumCircle(a: number[], b: number[], c: number[], p: number[]): boolean;

  /**
   * Determines if a given 2D point is within a given triangle.
   *
   * @param {number[]} a - First triangle point.
   * @param {number[]} b - Second triangle point.
   * @param {number[]} c - Third triangle point.
   * @param {number[]} p - 2D point.
   *
   * @returns {boolean}
   */
  static isPointInTriangle(a: number[], b: number[], c: number[], p: number[]): boolean;

  /**
   * Get the sorted indices of a given set of 2D points in counter-clockwise order.
   *
   * @param {number[]} indices - List of indices.
   * @param {number[][]} vertices - List of 2D points.
   *
   * @returns {number[][]} - List of sorted indices.
   */
  static sortPointsCCW(indices: number[], vertices: number[][]): number[];

  /**
   * Cacluates the area of a triangle.
   *
   * @param {number[]} a - First triangle point.
   * @param {number[]} b - Second triangle point.
   * @param {number[]} c - Third triangle point.
   *
   * @returns {number}
   */
  static triangleArea(a: number[], b: number[], c: number[]): number;

  /**
   * Return the magnitude of a given vector array.
   *
   * @param {number[]} vector - Array consisting of numbers.
   *
   * @returns {number}
   */
  static getVectorMagnitude(vector: number[]);

  /**
   * Return the dot product between two vectors.
   *
   * @param {number[]} vectorA - Array consisting of numbers.
   * @param {number[]} vectorB - Array consisting of numbers.
   *
   * @returns {number}
   */
  static getDotProduct(vectorA: number[], vectorB: number[]): number;

  /**
   * Return the angle in radians between vectorA and vectorB.
   *
   * @param {number[]} vectorA - Array consisting of numbers.
   * @param {number[]} vectorB - Array consisting of numbers.
   *
   * @returns {number}
   */
  static getAngleBetween(vectorA: number[], vectorB: number[]): number;

  /**
   * Multiply a 3x3 rotation matrix with a vector3.
   *
   * @param {number[]} vector3 - Array consisting of 3 numbers representing a direction vector.
   * @param {number[]} matrix3 - An array of 9 numbers representing a row major rotation matrix.
   *
   * @returns {number[]} - An array of 3 numbers representing the new direction of the vector.
   */
  static rotateVector(vector3: number[], matrix3: number[]): number[];

  /**
   * Normalize a given vector array.
   *
   * @param {number[]} vector - Array consisting of numbers.
   *
   * @returns {number[]} The original vector with normalized values, for chaining.
   */
  static normalizeVector(vector: number[]): number[];

  /**
   * Extract the 3x3 rotation matrix from a given 4x4 transformation matrix.
   *
   * @param {number[]} matrix4 - An array of 16 numbers representing a row major transformation matrix.
   *
   * @returns {number[]} - An array of 9 numbers representing a row major rotation matrix.
   */
  static getRotationMatrix(matrix4: number[]): number[];

  /**
   * Return an array containing the spherical coordinates of the given cartesian xyz coordinates.
   * Spherical coordinate system - https://en.wikipedia.org/wiki/Spherical_coordinate_system
   *
   * @private
   *
   * @param {number} x - Position along the x axis.
   * @param {number} y - Position along the y axis.
   * @param {number} z - Position along the z axis.
   *
   * @returns {Spherical} - An array consisting of three numberes where:
   *   index 0 represents the radius (radial distance r (distance to origin))
   *   index 1 represents the vertical/polar angle in radians (polar angle θ (theta) (angle with respect to polar axis))
   *   index 2 represents the horizontal/azimuthal angle in radians (azimuthal angle φ (phi) (angle of rotation from the initial meridian plane)).
   */
  static cartesianToSpherical(x: number, y: number, z: number): Spherical;

  /**
   * Return an array containing the spherical coordinates of the given cartesian xyz coordinates.
   *
   * @private
   *
   * @param {number} x - Position along the x axis.
   * @param {number} y - Position along the y axis.
   * @param {number} z - Position along the z axis.
   *
   * @returns {number[]} - An array consisting of three numberes where index 0 represents the radius, index 1 represents the vertical/polar angle in radians and index 2 represents the horizontal/azimuthal angle in radians.
   */
  static vector3ToSpherical(vector: number[]): number[];

  /**
   * Gradually change a value of a numeric property towards a goal over time using a critically damped spring function.
   *
   * @param {number} currentValue - The starting value.
   * @param {number} targetValue- The goal value.
   * @param {number[]} [valueStore = [0, 0]] - An Array consisting of two numbers where the first number holds the result value and the second holds the velocity that resulted in that value. The same array should be provided with each call to this function.
   * @param {number} [deltaTime = 1e-7] - The time since the last call to this function in seconds.
   * @param {number} [smoothTime = 0.3] - The approximate amount of time in seconds it should take to reach the target value.
   * @param {number} [maxSpeed = 1e7] - A clamping value for the maximum speed the value can change.
   *
   * @returns {number[]} - The valueStore array.
   */
  static dampValue(currentValue: number, targetValue: number, valueStore: number[] = [0, 0], deltaTime: number = 1e-7, smoothTime: number = 0.3, maxSpeed: number = 1e7): number[];
}

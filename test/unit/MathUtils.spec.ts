import {Vector2, Vector3, Vector4, Matrix3, Matrix4, Spherical, MathUtils as math} from 'three';
import {MathUtils, getCoords, getSpherical, getVectors, getVector, getVector2Array, ITriangle} from '@core/MathUtils';

describe('MathUtils', () => {
  describe('closestPointOnLine', () => {
    it('should find the closest point on a line segment', () => {
      [
        [
          [-1, -1],
          [1, 1],
          [-2, 0],
          [-1, -1],
        ],
        [
          [-1, -1],
          [1, 1],
          [2, 0],
          [1, 1],
        ],
        [
          [-1, -1],
          [1, 1],
          [0.5, -0.5],
          [0, 0],
        ],
      ].forEach((set) => {
        expect(MathUtils.closestPointOnLine(new Vector2(set[0][0], set[0][1]), new Vector2(set[1][0], set[1][1]), new Vector2(set[2][0], set[2][1]))).toEqual(new Vector2(set[3][0], set[3][1]));
      });
    });
  });

  describe('distanceSquared', () => {
    it('should calculate the distance squared', () => {
      [
        [[0, 0], [0, 1], 1],
        [[0, 0], [1, 1], 2],
        [[-1, -1], [1, 1], 8],
      ].forEach((set) => {
        expect(MathUtils.distanceSquared(new Vector2(set[0][0], set[0][1]), new Vector2(set[1][0], set[1][1]))).toEqual(set[2]);
      });
    });
  });

  describe('getDelaunayTriangulationOld', () => {
    it('should throw an error when vertices contains less than three points', () => {
      const points = [
        [0, 0],
        [0, 1],
      ];

      expect(() => {
        MathUtils.getDelaunayTriangulationOld(points);
      }).toThrowError();
    });

    it('should generate a triangulation that contains all original points', () => {
      const points: number[][] = [
        [-1, 1],
        [0, 1],
        [1, 1],
        [-1, 0],
        [0, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
      ];
      const triangles: number[][] = MathUtils.getDelaunayTriangulationOld(points);

      [...points.keys()].forEach((index) => {
        let isInTriangulation = false;

        triangles.forEach((triangle) => {
          triangle.forEach((triangleIndex) => {
            if (triangleIndex === index) {
              isInTriangulation = true;
            }
          });
        });

        expect(isInTriangulation).toBeTrue();
      });
    });

    it('should generate a triangulation that satisfies the Delaunay circumcircle property', () => {
      const points: number[][] = [
        [-1, 1],
        [0, 1],
        [1, 1],
        [-1, 0],
        [0, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
      ];
      const triangles: number[][] = MathUtils.getDelaunayTriangulationOld(points);

      triangles.forEach((triangle) => {
        [...points.keys()].forEach((index) => {
          if (triangle.indexOf(index) === -1) {
            const a = getVector(points[triangle[0]]);
            const b = getVector(points[triangle[1]]);
            const c = getVector(points[triangle[2]]);
            const p = getVector(points[index]);

            expect(MathUtils.isPointInCircumCircle(a, b, c, p)).not.toBeTrue();
          }
        });
      });
    });
  });

  describe('getDelaunayTriangulation', () => {
    it('should generate a triangulation that contains all original points', () => {
      const points: number[][] = [
        [-1, 1],
        [0, 1],
        [1, 1],
        [-1, 0],
        [0, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
      ];
      const vectors = getVector2Array(points);
      const triangles: number[][] = MathUtils.getDelaunayTriangulation(vectors);

      [...points.keys()].forEach((index) => {
        let isInTriangulation = false;

        triangles.forEach((triangle) => {
          triangle.forEach((triangleIndex) => {
            if (triangleIndex === index) {
              isInTriangulation = true;
            }
          });
        });

        expect(isInTriangulation).toBeTrue();
      });
    });

    it('should generate a triangulation that satisfies the Delaunay circumcircle property', () => {
      const points = [
        [-1, 1],
        [0, 1],
        [1, 1],
        [-1, 0],
        [0, 0],
        [1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
      ];

      const vectors = getVector2Array(points);
      const triangles = MathUtils.getDelaunayTriangulation(vectors);

      triangles.forEach((triangle) => {
        [...points.keys()].forEach((index) => {
          if (triangle.indexOf(index) === -1) {
            const a = getVector(points[triangle[0]]);
            const b = getVector(points[triangle[1]]);
            const c = getVector(points[triangle[2]]);
            const p = getVector(points[index]);

            expect(MathUtils.isPointInCircumCircle(a, b, c, p)).not.toBeTrue();
          }
        });
      });
    });
  });

  describe('isPointInCircumCircle', () => {
    it('should return true when the given point is within the triangle circumcircle', () => {
      const points = [
        [-1, -1],
        [1, 0],
        [0, 1],
      ];
      const vectors: [Vector2, Vector2, Vector2] = getVectors(points);

      expect(MathUtils.isPointInCircumCircle(...vectors, new Vector2(0, 0))).toBeTrue();
    });

    it('should return false when the given point is within the triangle circumcircle', () => {
      const points = [
        [-1, -1],
        [1, 0],
        [0, 1],
      ];

      const vectors: [Vector2, Vector2, Vector2] = getVectors(points);
      expect(MathUtils.isPointInCircumCircle(...vectors, new Vector2(-2, 0))).not.toBeTrue();
    });
  });

  describe('isPointInTriangle', () => {
    it('should return true when the given point is within the triangle', () => {
      const points = [
        [-1, -1],
        [0, 1],
        [1, 0],
      ];
      const vectors: [Vector2, Vector2, Vector2] = getVectors(points);

      expect(MathUtils.isPointInTriangle(...vectors, new Vector2(0, 0))).toBeTrue();
    });

    it('should return false when the given point is within the triangle', () => {
      const points = [
        [-1, -1],
        [0, 1],
        [1, 0],
      ];

      const vectors: [Vector2, Vector2, Vector2] = getVectors(points);
      expect(MathUtils.isPointInTriangle(...vectors, new Vector2(-2, 0))).not.toBeTrue();
    });
  });

  describe('sortPointsCCW', () => {
    it('should sort points in counter-clockwise order', () => {
      const points = [
        [0, 0],
        [-1, 1],
        [-1, 0],
      ];
      const orderCCW = [2, 0, 1];
      const vectors: [Vector2, Vector2, Vector2] = getVectors(points);

      expect(MathUtils.sortPointsCCW([...orderCCW].reverse(), vectors)).toEqual(orderCCW);
    });
  });

  describe('triangleArea', () => {
    it('should calculate the area of a triangle', () => {
      const points = [
        [-1, -1],
        [-1, 0],
        [1, -1],
      ];
      const vectors: [Vector2, Vector2, Vector2] = getVectors(points);

      expect(MathUtils.triangleArea(...vectors)).toEqual(1.0);
    });
  });

  describe('getVectorMagnitude', () => {
    it('should return the length of a Vector2', () => {
      [
        [[1, 0], 1],
        [[0, 6], 6],
      ].forEach((set) => {
        expect(MathUtils.getVector2Magnitude(new Vector2(set[0][0], set[0][1]))).toEqual(set[1]);
      });
    });

    it('should return the length of a Vector3', () => {
      [
        [[0, 1, 0], 1],
        [[4, 2, 4], 6],
      ].forEach((set) => {
        expect(MathUtils.getVector3Magnitude(new Vector3(set[0][0], set[0][1], set[0][2]))).toEqual(set[1]);
      });
    });

    it('should return the length of a Vector4', () => {
      [
        [[0, 0, 1, 0], 1],
        [[-2, 0, 4, -4], 6],
      ].forEach((set) => {
        expect(MathUtils.getVector4Magnitude(new Vector4(set[0][0], set[0][1], set[0][2], set[0][3]))).toEqual(set[1]);
      });
    });
  });

  describe('cartesianToSpherical', () => {
    it('should return Spherical (radius, phi (polar angle), theta (azimuthal angle)) corresponding to the given x, y, z coordinates', () => {
      // Spherical tests h- ttps://github.com/mrdoob/three.js/blob/dev/test/unit/src/math/Spherical.tests.js
      [
        [
          [0, 0, 0],
          [0, 0, 0],
        ],
        [
          [0, 3, 0],
          [3, 0, 0],
        ],
        [
          [0, 0, 5],
          [5, Math.PI / 2, 0],
        ],
        [
          [-1, 0, 0],
          [1, Math.PI / 2, -Math.PI / 2],
        ],
      ].forEach((set) => {
        const {x, y, z} = getCoords(set[0]);

        expect(MathUtils.cartesianToSpherical(x, y, z)).toEqual(getSpherical(set[1]));
      });
    });
  });

  describe('getDotProduct', () => {
    it('should return the amount one vector goes in the direction of another', () => {
      expect(MathUtils.getDotProduct(new Vector2(1, 1), new Vector2(2, 2))).toEqual(4);

      expect(MathUtils.getDotProduct(new Vector2(0, 5), new Vector2(1, 1))).toEqual(5);
    });
  });

  describe('getAngleBetween', () => {
    it('should calculate the angle in radians between two vectors', () => {
      const angle1 = MathUtils.getAngleBetween(new Vector2(0, 1), new Vector2(0, 1));

      expect(Math.abs(angle1)).toBeLessThanOrEqual(Number.EPSILON);

      expect(Math.abs(MathUtils.getAngleBetween(new Vector2(0, 1), new Vector2(1, 0)) - Math.PI / 2)).toBeLessThanOrEqual(Number.EPSILON);
    });
  });

  describe('rotateVector', () => {
    it('should return a new Vector3 rotated by the amount of the Matrix3', () => {
      expect(MathUtils.rotateVector(new Vector3(0, 1, 0), new Matrix3().fromArray([0, -1, 0, 1, 0, 0, 0, 0, 1]))).toEqual(new Vector3(1, 0, 0));
    });
  });

  describe('normalizeVector', () => {
    it('should update the values of the input Vector3 with values that result in the same direction and a length of 1', () => {
      const v1 = new Vector3(10, 0, 0);
      MathUtils.normalizeVector3(v1);

      expect(v1).toEqual(new Vector3(1, 0, 0));

      const v2 = new Vector3(4, 2, 4);
      MathUtils.normalizeVector3(v2);

      expect(v2).toEqual(new Vector3(2 / 3, 1 / 3, 2 / 3));
    });
  });

  describe('getRotationMatrix', () => {
    it('should return a Matrix3 type', () => {
      const m4 = new Matrix4().identity();
      const result = MathUtils.getRotationMatrix(m4);

      expect(result).toBeInstanceOf(Matrix3);
    });

    it('should return the rotation component of the input Matrix4', () => {
      const m4 = new Matrix4().identity();
      const m3 = new Matrix3().identity();
      const input = [0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 0, 1];
      const result = [0, 0, 1, 0, 1, 0, -1, 0, 0];

      expect(MathUtils.getRotationMatrix(m4)).toEqual(m3);
      expect(MathUtils.getRotationMatrix(input)).toEqual(new Matrix3().fromArray(result));
      expect(MathUtils.getRotationMatrix(new Matrix4().fromArray(input))).toEqual(new Matrix3().fromArray(result));
    });
  });

  describe('dampValue', () => {
    it('should return an array where the first number is between or equal to the currentValue and targetValue', () => {
      const [result1] = MathUtils.dampValue(1, 10, [0, 0], 1);

      expect(result1).toBeGreaterThanOrEqual(1);
      expect(result1).toBeLessThanOrEqual(10);

      const [result2] = MathUtils.dampValue(50, 85, [0, 0], 1);

      expect(result2).toBeGreaterThanOrEqual(50);
      expect(result2).toBeLessThanOrEqual(85);
    });
  });
});
